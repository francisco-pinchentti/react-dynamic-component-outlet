import React from 'react';
import { DynamicComponentParserEntry, parseHTMLString } from '../utils';

export type DynamicComponentOutletProps = {
    htmlString?: string;
    customParsers?: DynamicComponentParserEntry[];
}

export function DynamicComponentOutlet(
    {
        htmlString,
        customParsers,
    }: DynamicComponentOutletProps
) {

    return (
        <>
            {htmlString && parseHTMLString(htmlString, customParsers)}
        </>
    )
}

export default DynamicComponentOutlet;
