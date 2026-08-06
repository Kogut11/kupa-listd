import List from './pages/List.js';
import Legacy from './pages/Legacy.js';

import Leaderboard from './pages/Leaderboard.js';
import LegacyLeaderboard from './pages/LegacyLeaderboard.js';

import Roulette from './pages/Roulette.js';
import ListPacks from './pages/ListPacks.js';

export default [
    { path: '/', component: List },
    { path: '/legacy', component: Legacy },

    { path: '/leaderboard', component: Leaderboard },
    { path: '/legacyleaderboard', component: LegacyLeaderboard },

    { path: '/roulette', component: Roulette },
    { path: '/listpacks', component: ListPacks },
];
