import React, { useMemo, useEffect, useState } from "react";
import objectPath from "object-path";
import { useHtmlClassService } from "../../_core/MetronicLayout";
import { Topbar } from "./Topbar";
import AnimateLoading from "../../../_partials/controls/AnimateLoading.js";
import { useSelector } from 'react-redux';
import { convertToPascalCase } from "../../../../app/utils/common-functions";

export function Header() {
    const uiService = useHtmlClassService();
    const { title } = useSelector((state) => state.header);
    const [headerText, setHeaderText] = useState('');
    const pathName = window.location.pathname;

    useEffect(() => {
        const str = title ? title : window.location.pathname ? convertToPascalCase(window.location.pathname.replace("/", "")) : ""
        setHeaderText(str);
    }, [pathName, title]);

    const layoutProps = useMemo(() => {
        return {
            headerClasses: uiService.getClasses("header", true),
            headerAttributes: uiService.getAttributes("header"),
            headerContainerClasses: uiService.getClasses("header_container", true),
            menuHeaderDisplay: objectPath.get(uiService.config, "header.menu.self.display"),
        };
    }, [uiService]);

    return (
        <>
            {/*begin::Header*/}
            <div className={`header ${layoutProps.headerClasses}`} id="kt_header" {...layoutProps.headerAttributes} >
                {/*begin::Container*/}
                <div className={` ${layoutProps.headerContainerClasses} d-flex align-items-stretch justify-content-between ml-4 mb-3`}>
                    <AnimateLoading />
                    {/*begin::Header Menu Wrapper*/}
                    <div className="d-flex align-items-baseline mr-5">
                        <h5 className="text-dark font-weight-bold my-2 mr-5 mt-8 text-capitalize">
                            <>{headerText}</>
                            {/*<small></small>*/}
                        </h5>
                    </div>
                    {/*end::Header Menu Wrapper*/}

                    {/*begin::Topbar*/}
                    <Topbar />
                    {/*end::Topbar*/}
                </div>
                {/*end::Container*/}
            </div>
            {/*end::Header*/}
        </>
    );
}
