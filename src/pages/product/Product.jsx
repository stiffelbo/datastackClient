import React, { useMemo } from 'react';

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

    const columns = useMemo(() => {
        return (entity?.schema?.columns ?? [])
            .filter(Boolean)
            .map(column => {
                if (column.field !== 'tags') {
                    return column;
                }

                return {
                    ...column,
                    delimiter: ',',
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
    }, [
        entity?.schema?.columns,
        entity?.schema?.options?.tags,
        entity.update,
    ]);

    const dashboardEntity = useMemo(() => ({
        ...entity,

        schema: {
            ...entity.schema,
            columns,
        },
    }), [
        entity,
        columns,
    ]);

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