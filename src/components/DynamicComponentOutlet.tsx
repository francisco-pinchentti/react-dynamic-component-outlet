import React from 'react';
import { DynamicComponentParserEntry, parseHTMLString } from '../utils';

export type DynamicComponentOutletProps = {
    htmlString?: string;
    customParsers?: DynamicComponentParserEntry[];
}

function DynamicComponentOutlet(
    {
        htmlString,
        customParsers,
    }: DynamicComponentOutletProps
) {

    // @todo useMemo()

    return (
        <>
            {htmlString && parseHTMLString(htmlString, customParsers)}
        </>
    )
}

export default DynamicComponentOutlet;
