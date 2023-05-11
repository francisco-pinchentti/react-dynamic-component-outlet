import React, { ReactElement, cloneElement, createElement, isValidElement } from 'react';

import { convert } from './react-attr-converter';
import { isFunction, isString} from './typeguards';

type DCEntryMatcher =
    // @todo we should use this one but throws some TS error:
    // (a: Element) => boolean
    Function
    // for string, comparison will be made using tagName (UPPERCASE)
    // see https://developer.mozilla.org/en-US/docs/Web/API/Element/tagName
    | string;

type DCEntryBuilder =
    (node: Element) => ReactElement
        | ReactElement;

/**
 * For supporting custom elements and/or node substitution during parsing,
 * every matcher will be evaluated when a new node is created,
 * and if the matcher returns true it's corresponding component
 * will be used instead
 */
export type DynamicComponentParserEntry = {
    matcher: DCEntryMatcher;
    component: DCEntryBuilder;
}

const copyNodeAttributes = (
    node: Element
): any => {

    return node
        .getAttributeNames()
        .reduce((acc, curr) => {
            const attrName = convert(curr);
            const value = node.getAttribute(curr);

            return {
                ...acc,
                [attrName]: value
            }
        }, {});
}

/**
 * Simple parse strategy using document range.createContextualFragment(HTML STRING)
 */
export const parseHTMLString = (
    htmlString: string,
    customParsers: DynamicComponentParserEntry[] = []
) => {

    const df = document.createRange().createContextualFragment(htmlString);

    return parseNodeChildren(customParsers, df.childNodes);
}

const parseNodeChildren = (
    customParsers: DynamicComponentParserEntry[],
    children: NodeList,
): JSX.Element[] => {

    return Array
        .from(children)
        .map(n => parseNode(customParsers, n))
        // add key attribute on cases where it's needed:
        .map((n, idx) => isString(n) ? n : ({ ...n, key: idx }));
}

const parseNode = (
    customParsers: DynamicComponentParserEntry[],
    node: Node,
): JSX.Element => {

    if (node.nodeType === Node.TEXT_NODE) {
        return (!!node.textContent) ? <>{node.textContent}</> : <></>;
    }

    const reactElement = parseWithCustomParsers(customParsers, node as Element);

    if (reactElement) {
        // still need to check child nodes to see if they have components:
        const children = parseNodeChildren(customParsers, node.childNodes);
        return cloneElement(reactElement, reactElement.props, children);
    }

    if (node.nodeType === Node.ELEMENT_NODE){ 
        return parseElementNode(customParsers, node as Element);
    }
    
    return <></>;
}

const parseElementNode = (
    customParsers: DynamicComponentParserEntry[],
    node: Element,
): JSX.Element => {
    const tag = node.tagName.toLowerCase();
    const children: ReactElement[] = parseNodeChildren(customParsers, node.childNodes);

    // @todo decide what to do with onclick, onload, etc:
    const props = copyNodeAttributes(node);

    return createElement(tag, props, children);
}

const parseWithCustomParsers = (
    customParsers: DynamicComponentParserEntry[],
    node: Element,
) => {

    const candidate = customParsers.find((cpEntry: DynamicComponentParserEntry) => {
        if (isString(cpEntry.matcher)) {
            return node.tagName === cpEntry.matcher;
        } else if (isFunction(cpEntry.matcher)) {
            return cpEntry.matcher(node);
        }
    });

    if (!candidate) {
        return null;
    }

    if (isFunction(candidate.component)) {
        return candidate.component(node);
    } else if (isValidElement(candidate.component)) {
        return candidate.component;
    }
}
