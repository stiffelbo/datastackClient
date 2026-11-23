export const PRODUCTION_TASKS_LAYOUTS = {
    route: {
        left: null,
        right: null,
    },

    processes: {
        left: {
            component: 'processes',
            width: 320,
            minWidth: 260,
        },
        right: null,
    },

    routes: {
        mode: 'replace',
        component: 'routes',
    },

    task: {
        left: null,
        right: {
            component: 'task',
            width: 380,
            minWidth: 320,
        },
    },

    'relations-in': {
        left: null,
        right: {
            component: 'relations-in',
            width: 360,
            minWidth: 300,
        },
    },

    'relations-out': {
        left: null,
        right: {
            component: 'relations-out',
            width: 360,
            minWidth: 300,
        },
    },
};