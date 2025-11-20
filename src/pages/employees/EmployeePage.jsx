import React from 'react';
import BaseEntityPage from '../../components/dashboard/BaseEntityPage';

//Componnents / sub pages imports



/**
 * EmployeePage
 *
 * Props dostarczane przez BaseEntityDashboard (cloneElement):
 * - entity: wynik useEntity (masz rows, schema, metody)
 * - dashboard: useDashboard(entityName) → currentId, tab, filters, itd.
 * - id: aktualne id rekordu
 * - row: aktualny rekord (z entity.rows)
 * - rows: wszystkie rekordy
 * - schema: entity.schema
 * - onChangeId: (nextId|null) => void
 */
const EmployeePage = ({ entityName, entity, dashboard}) => {
    // tu możesz robić wszystko:
    // - FormTemplate z schema.editForm
    // - CommentsTab, FilesTab, mappingi
    // - dodatkowe ApiLoader-y
    // - używać dashboard.viewMode / dashboard.filters jeśli chcesz
    const { currentId, setCurrentId, tab, setTab } = dashboard;

    const tabs = [
        //tutaj definicje tabsów i implementacja sub komponentów wstrzikwanie propsów.
    ];

    return (
        <BaseEntityPage 
            entityName={entityName}
            id={currentId}
            rows={entity.rows}
            row={entity.rows.find(i => i.id === currentId)}
            onChangeId={setCurrentId}
            tabs={tabs}
            //ten komponent powinien sie połączyć z auth kontekstem po entityName i sobie sam odfiltrowac tabsy. 
        />
    );
};

export default EmployeePage;
