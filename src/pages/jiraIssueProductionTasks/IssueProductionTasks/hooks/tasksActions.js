/* Repository of tasks action logics:
- validation,
- prepare payload,
- make async calls to fullfill action needs

*/

const createTasksActions = ({entity, uiState}) => {
    const {context, history, create, updateField, fetchRows} = entity;

    //fabryczka metod wyposarzonych w konkretne dane i narzedzia z propsów.

    return tasksActions;
}

const tasksActions = {
    addStart : ({data}) => {
        /* 
        Scenarios:

        */
    },
    addEnd : ({data}) => {
        console.log(data);
        console.log(tasks);
        console.log(selectedTaskId);
    },
    addAfter : ({data}) => {
        console.log(data);
        console.log(tasks);
        console.log(selectedTaskId);
    },
    addFree : ({data}) => {
        console.log(data);
        console.log(tasks);
        console.log(selectedTaskId);
    },
}

export default createTasksActions;