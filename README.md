README.md
=========

## Summary

Provides a react component that can receive and parse a string containing
html code.

An additional optional prop is allowed to allow custom parsing for each node.

Internally it uses document range createContextualFragment, and thus matcher
and component callbacks will receive the created Node.

This is a very small library and the focus is simplicity while respecting the
nesting of parsed content. It does not prevent any sort of XSRF nor can parse
inline event handlers (like on-click, on-load and such).

## Examples

### The simplest use case

```tsx

function MyComponent() {

    const htmlString = `
        <h1>Welcome</h1>
        <p>Hello <spac class="bold">World</span></p>
    `;

    return (
        <DynamicComponentOutlet htmlString={htmlString} />
    );
}

```

### Using some custom elements

```tsx

function MyComponent() {

    const htmlString = `
        <script src=""></script>
        <p>Lorem<span>Ipsum</span></p>
        <p>
            <SupperButton>
                See More
                <tooltip-ksx>Click For Much Win</tooltip-ksx>
            </SupperButton>
        </p>
    `;

    const fnClick = () => {
        //
    }

    const customParsers = [
        {
            matcher: 'SUPERBUTTON',
            component: <SupperButtonComponent onClick={fnClick} />
        },
        {
            matcher: (node: Element) => node.outerHtml.test(/^tooltip/i),
            component: (node: Element) => <MyTooltip text={node.textContent} />
        },
        {
            matcher: (node: Element) => node instanceof HTMLScriptElement && node.getAttribute('src'),
            component: (node: Element) => <script src={node.getAttribute('src')!}></script>
        }
    ];

    return (
        <DynamicComponentOutlet htmlString={htmlString} customParsers={customParsers} />
    );
}

```

## See also

Cool projects with similar goals

https://github.com/MomenSherif/react-html-string

https://github.com/remarkablemark/html-react-parser

https://github.com/remarkablemark/react-dom-core/tree/master/packages/react-property

https://github.com/hatashiro/react-attr-converter
