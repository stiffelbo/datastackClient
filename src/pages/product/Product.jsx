import React from 'react';

// Hooks
import useEntity from '../../hooks/useEntity';

// Components
import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';
import ProductPage from './ProductPage';
import ProductTags from './ProductTags';

const entityName = "Product";
const basePath = "/product";
const endpoint = "/product/";

const Dashboard = () => {
    const entity = useEntity({ entityName, endpoint });

    const columns = () => {
        return (entity?.schema?.columns ?? [])
            .filter(Boolean)
            .map(column => {
                if (column.field !== 'tags') {
                    return column;
                }

                return {
                    ...column,
                    delimiter: ',',
                    editable : false,
                    renderCell: params => (
                        <ProductTags
                            value={params.value}
                            options={entity?.schema?.options?.tags ?? []}
                            compact
                            onChange={value => {
                                entity.update(
                                    params.row.id,
                                    { tags: value }
                                );
                            }}
                        />
                    ),
                };
            });
    }

    const dashboardEntity = {
        ...entity,

        schema: {
            ...entity.schema,
            columns: columns(),
        },
    }

    return (
        <BaseEntityDashboard
            renderPage={(props) => (
                <ProductPage
                    entity={dashboardEntity}
                    entityName={entityName}
                    {...props}
                />
            )}
            entity={dashboardEntity}
            entityName={entityName}
            basePath={basePath}
            listProps={{
                treeConfig: {
                    parentField: 'parent_id',
                    idField: 'id',
                    rootValue: null,
                },
            }}
        />
    );
};

export default Dashboard;