import { round, score } from './score.js';

/**
 * Path to directory containing `_list.json` and all levels
 */
const dir = '/data';
//Tags
export async function fetchTags() {
  try {
    const response = await fetch('/data/_tags.json');
    return await response.json();
  } catch {
    return [];
  }
}

async function fetchListFile(file) {
    try {
        const response = await fetch(`${dir}/${file}`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const list = await response.json();

        if (!Array.isArray(list)) {
            throw new Error(`${file} must contain an array`);
        }

        return await Promise.all(
            list.map(async (path, rank) => {
                const levelResult = await fetch(`${dir}/${path}.json`);

                try {
                    const level = await levelResult.json();

                    return [
                        {
                            ...level,
                            path,
                            records: Array.isArray(level.records)
                                ? level.records.sort(
                                      (a, b) => b.percent - a.percent
                                  )
                                : [],
                        },
                        null,
                    ];
                } catch {
                    console.error(
                        `Failed to load level #${rank + 1} ${path}.`
                    );

                    return [null, path];
                }
            })
        );
    } catch (error) {
        console.error(`Failed to load ${file}:`, error);
        return null;
    }
}

export async function fetchList() {
    return await fetchListFile("_list.json");
}

export async function fetchLegacy() {
    return await fetchListFile("_legacy.json");
}

export async function fetchCountries() {
    try {
        const result = await fetch('/data/_countries.json');
        return await result.json();
    } catch {
        return {};
    }
}

export async function fetchEditors() {
    try {
        const editorsResults = await fetch(`${dir}/_editors.json`);
        const editors = await editorsResults.json();
        return editors;
    } catch {
        return null;
        }
    }

export async function fetchLeaderboard(legacy = false) {
    const list = legacy
        ? await fetchLegacy()
        : await fetchList();

    const scoreMap = {};
    const errs = [];

    if (!list) {
        return [
            [],
            [`Failed to load ${legacy ? "legacy" : "main"} list.`]
        ];
    }

    list.forEach(([level, err], rank) => {
        if (err) {
            errs.push(err);
            return;
        }

        // Verification
        const verifier = Object.keys(scoreMap).find(
            (u) =>
                u.toLowerCase() ===
                level.verifier.toLowerCase()
        ) || level.verifier;

        scoreMap[verifier] ??= {
            verified: [],
            completed: [],
            progressed: [],
        };

        const { verified } = scoreMap[verifier];

        verified.push({
            rank: rank + 1,
            level: level.name,
            score: score(
                rank + 1,
                100,
                level.percentToQualify
            ),
            link: level.verification,
        });

        // Records
        level.records.forEach((record) => {
            const user = Object.keys(scoreMap).find(
                (u) =>
                    u.toLowerCase() ===
                    record.user.toLowerCase()
            ) || record.user;

            scoreMap[user] ??= {
                verified: [],
                completed: [],
                progressed: [],
            };

            const { completed, progressed } =
                scoreMap[user];

            if (record.percent === 100) {
                completed.push({
                    rank: rank + 1,
                    level: level.name,
                    score: score(
                        rank + 1,
                        100,
                        level.percentToQualify
                    ),
                    link: record.link,
                });

                return;
            }

            progressed.push({
                rank: rank + 1,
                level: level.name,
                percent: record.percent,
                score: score(
                    rank + 1,
                    record.percent,
                    level.percentToQualify
                ),
                link: record.link,
            });
        });
    });

    const leaderboard = Object.entries(scoreMap).map(
        ([user, scores]) => {
            const {
                verified,
                completed,
                progressed
            } = scores;

            const total = [
                verified,
                completed,
                progressed
            ]
                .flat()
                .reduce(
                    (prev, cur) => prev + cur.score,
                    0
                );

            return {
                user,
                total: round(total),
                ...scores,
            };
        }
    );

    return [
        leaderboard.sort(
            (a, b) => b.total - a.total
        ),
        errs
    ];
      // Wrap in extra Object containing the user and total score
    const res = Object.entries(scoreMap).map(([user, scores]) => {
        const { verified, completed, progressed } = scores;
        const total = [verified, completed, progressed]
            .flat()
            .reduce((prev, cur) => prev + cur.score, 0);

        return {
            user,
            total: round(total),
            ...scores,
        };
    });

    // Sort by total score
    return [res.sort((a, b) => b.total - a.total), errs];
}

