// React bootstrap table next =>
// DOCS: https://react-bootstrap-table.github.io/react-bootstrap-table2/docs/
// STORYBOOK: https://react-bootstrap-table.github.io/react-bootstrap-table2/storybook/index.html
import React, { useEffect, useState } from "react";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory, {
    PaginationProvider,
} from "react-bootstrap-table2-paginator";
import {
    getSelectRow,
    NoRecordsFoundMessage,
    PleaseWaitMessage,
} from "../../_metronic/_helpers";
import { Pagination } from "../../_metronic/_partials/controls/pagination/Pagination";
import { TableFilter } from "./Table-filter";

export function TableView({
    columns,
    dataSource,
    paginationParams,
    listLoading,
    selectRows,
    hideExtra,
    hideSelect,
    searchValue,
    setSearchValue,
    setReload,
}) {
    const [ids, setIds] = useState([]);

    useEffect(() => {
        let formIds = [];

        if (dataSource?.length) {
            dataSource.map((row) => formIds.push(row.id));
            // setIds(formIds);
        }
    }, [dataSource, setReload]);

    const sizePerPageList = [
        { text: "3", value: 3 },
        { text: "5", value: 5 },
        { text: "10", value: 10 },
    ];

    // Table pagination properties
    const paginationOptions = {
        custom: true,
        totalSize: paginationParams?.totalCount,
        sizePerPageList: sizePerPageList,
        sizePerPage: paginationParams?.pageSize || 10,
        page: paginationParams?.current || 1,
        onPageChange: paginationParams.onPageChange,
        onSizePerPageChange: paginationParams.onSizeChange,
    };

    const table = (paginationTableProps) => (
        <BootstrapTable
            wrapperClasses="table-responsive"
            classes="table table-head-custom table-vertical-center overflow-hidden"
            bootstrap4
            bordered={false}
            remote={{}}
            keyField="id"
            data={dataSource ? dataSource : []}
            columns={columns}
            onTableChange={() => paginationParams?.onChange()}
            {...paginationTableProps}
            width={columns && columns.length ? 50 : 0}
            selectRow={
                selectRows
                    ? getSelectRow({
                          entities: dataSource,
                          ids: ids || [],
                          setIds: setIds || [],
                          hideSelectAll: hideSelect,
                          hideSelectColumn: !hideSelect,
                          onSelect: selectRows,
                      })
                    : getSelectRow({
                          hideSelectAll: true,
                          hideSelectColumn: true,
                      })
            }
        ></BootstrapTable>
    );

    return (
        <>
            {hideExtra ? (
                table()
            ) : (
                <>
                    {" "}
                    <TableFilter
                        setSearchValue={setSearchValue}
                        searchValue={searchValue}
                        setReload={setReload}
                    />
                    <PaginationProvider
                        pagination={paginationFactory(paginationOptions)}
                    >
                        {({ paginationProps, paginationTableProps }) => {
                            return (
                                <Pagination
                                    isLoading={listLoading}
                                    paginationProps={paginationProps}
                                    show={!hideExtra}
                                >
                                    {table(paginationTableProps)}
                                    {!hideExtra ? (
                                        <>
                                            <PleaseWaitMessage
                                                entities={dataSource}
                                            />
                                            <NoRecordsFoundMessage
                                                entities={dataSource}
                                            />
                                        </>
                                    ) : null}
                                </Pagination>
                            );
                        }}
                    </PaginationProvider>{" "}
                </>
            )}
        </>
    );
}
