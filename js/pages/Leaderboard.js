import { fetchLeaderboard } from '../content.js';
import { localize } from '../util.js';

import Spinner from '../components/Spinner.js';

export default {
    components: {
        Spinner,
    },
    data: () => ({
        leaderboard: [],
        loading: true,
        selected: 0,
        searchQuery: '',
        err: [],
    }),
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-leaderboard-container">
            <div class="page-leaderboard">
                <div class="error-container">
                    <p class="error" v-if="err.length > 0">
                        Leaderboard may be incorrect, as the following levels could not be loaded: {{ err.join(', ') }}
                    </p>
                </div>

                <div class="board-container">
                    <div class="search-bar">
                        <input
                            type="text"
                            v-model="searchQuery"
                            placeholder="Search players..."
                        />
                    </div>

                    <table class="board">
                        <tr v-for="(ientry, i) in filteredLeaderboard" :key="ientry.user">
                            <td class="rank">
                                <p class="type-label-lg">#{{ leaderboard.indexOf(ientry) + 1 }}</p>
                            </td>
                            <td class="total">
                                <p class="type-label-lg">{{ localize(ientry.total) }}</p>
                            </td>
                            <td
                                class="user"
                                :class="{ 'active': selectedEntry === ientry }"
                            >
                                <button @click="selectPlayer(ientry)">
                                    <span class="type-label-lg">{{ ientry.user }}</span>
                                </button>
                            </td>
                        </tr>
                    </table>

                    <p v-if="filteredLeaderboard.length === 0" class="no-results">
                        No players match your search.
                    </p>
                </div>

                <div class="player-container" v-if="entry">
                    <div class="player">
                        <h1>#{{ leaderboard.indexOf(entry) + 1 }} {{ entry.user }}</h1>
                        <h3>{{ entry.total }}</h3>

};
