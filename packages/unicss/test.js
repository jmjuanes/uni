import {configure, css, globalCss, keyframes, extractCss, transform} from "./unicss.js";

describe("unicss", () => {
    describe("extractCss", () => {
        it("should return the saved styles", () => {
            expect(extractCss()).toBe("");
        });
    });
    describe("css", () => {
        configure({
            key: "test/css",
            theme: {
                colors: {
                    primary: "__primary",
                    secondary: "__secondary",
                },
            },
        });
        it("should return a valid classname", () => {
            const element1 = css({});
            const element2 = css({
                color: "white",
            });
            expect(element1).toBe("uni-0");
            expect(extractCss()).toEqual(expect.stringContaining(`.${element2} {color: white;}`));
        });
        it("should apply theme", () => {
            const element = css({
                borderColor: t => t.colors.secondary,
                color: t => `${t.colors.primary}!important`,
            });
            expect(extractCss()).toEqual(
                expect.stringContaining(`.${element} {border-color: __secondary; color: __primary !important;}`),
            );
        });
    });
    describe("keyframes", () => {
        it("(keyframes) should parse and generate keyframes", () => {
            const name = keyframes({
                from: {opacity: 0},
                to: {opacity: 1},
            });
            expect(name).not.toBe("");
            expect(extractCss()).toEqual(expect.stringContaining(`@keyframes ${name}`));
        });
    });
    describe("globalCss", () => {
        it("should generate global styles", () => {
            globalCss({
                "html": {
                    backgroundColor: "white",
                },
                "@keyframes test-anim": {
                    from: {left: "0px"},
                    to: {left: "100px"},
                },
                "@fontFace": [
                    {src: "source-font1"},
                    {src: "source-font2"},
                ],
            });
            const styles = extractCss();
            expect(styles).toEqual(expect.stringContaining("html {background-color: white;}"));
            expect(styles).toEqual(expect.stringContaining("@keyframes test-anim"));
            expect(styles).toEqual(expect.stringContaining("@font-face {src: source-font1;}"));
            expect(styles).toEqual(expect.stringContaining("@font-face {src: source-font2;}"));
        });
    });
    describe("styled", () => {
        const pragma = jest.fn((tag, props) => ({tag, props}));
        configure({
            pragma: pragma,
            theme: {
                colors: {
                    bg: "styled__bg",
                },
            },
        });
        it("should call the pragma function", () => {
            styled("div", {})({});
            expect(pragma).toBeCalledTimes(1);
        });
        it("should forward props", () => {
            const vnode = styled("div", {})({align: "center"});
            expect(vnode.props.align).toEqual("center");
        });
        it("should allow to overwrite 'as' prop", () => {
            const vnode = styled("div", {})({as: "a"});
            expect(vnode.tag).toEqual("a");
        });
        it("should concat classNames", () => {
            const vnode = styled("div", {})({className: "test"});
            expect(vnode.props.className).toEqual(
                expect.stringContaining("test"),
            );
        });
        it("should support custom themes", () => {
            const vnode = styled("div", {
                backgroundColor: t => t.colors.bg,
            })({});
            expect(vnode.props.className).toEqual(expect.stringContaining("uni-"));
            expect(extractCss()).toEqual(expect.stringContaining("background-color: styled__bg;"));
        });
        it("should support variants", () => {
            const component = styled("div", {
                color: "white",
                variants: {
                    default: {
                        fontSize: "16px",
                    },
                },
            });
            const vnode = component({variant: "default"});
            expect(extractCss()).toEqual(
                expect.stringContaining("color: white; font-size: 16px;"),
            );
        });
    });
    describe("transform", () => {
        const context = {
            theme: {
                colors: {
                    primary: "__primary",
                    secondary: "__secondary",
                },
            },
            aliases: {
                size: ["height", "width"],
            },
        };
        const generateRules = css => transform(css, context);
        it("should apply custom aliases", () => {
            const rules = generateRules({
                ".test": {
                    size: "1px",
                },
            });
            expect(rules[0]).toEqual(".test {height:1px;width:1px;}");
        });
        it("should apply theme", () => {
            const rules = generateRules({
                ".test": {
                    backgroundColor: t => t.colors.secondary,
                    color: t => t.colors.primary,
                },
            });
            expect(rules[0]).toEqual(
                ".test {background-color:__secondary;color:__primary;}",
            );
        });
        it("should apply global @media", () => {
            const rules = generateRules({
                "@media (max-width: 0px)": {
                    test: {
                        color: "blue",
                    },
                },
            });
            expect(rules[0]).toEqual("@media (max-width: 0px) {test {color:blue;}}");
        });
        it("should apply local @media", () => {
            const rules = generateRules({
                test: {
                    "@media (max-width: 0px)": {
                        color: "blue",
                    },
                },
            });
            expect(rules[0]).toEqual("@media (max-width: 0px) {test {color:blue;}}");
        });
        it("should apply @keyframes", () => {
            const rules = generateRules({
                "@keyframes test": {
                    from: {opacity: 0},
                    to: {opacity: 1},
                },
            });
            expect(rules[0]).toEqual("@keyframes test {from {opacity:0;} to {opacity:1;}}");
        });
        it("should apply @font-face", () => {
            const rules = generateRules({
                "@font-face": [
                    {src: "source-font1"},
                    {src: "source-font2"},
                ],
            });
            expect(rules[0]).toEqual("@font-face {src:source-font1;}");
            expect(rules[1]).toEqual("@font-face {src:source-font2;}");
        });
        it("should apply @import", () => {
            const rules = generateRules({
                "@import": [
                    "source1",
                    "source2",
                ],
            });
            expect(rules[0]).toEqual("@import source1;");
            expect(rules[1]).toEqual("@import source2;");
        });
    });
    describe("classNames", () => {
        it("should join arguments into a single string", () => {
            const className = classNames("foo", "bar", "baz");
            expect(className).toBe("foo bar baz");
        });
        it("should add only classes with a truthly value in an object", () => {
            const className = classNames({
                foo: true,
                bar: false,
                baz: true,
            });
            expect(className).toBe("foo baz");
        });
        it("should join all elements in an array", () => {
            const className = classNames(["foo", "bar"], "baz");
            expect(className).toBe("foo bar baz");
        });
    });
    describe("merge", () => {
        it("should merge two style objects", () => {
            const styles1 = {
                color: "white",
                margin: "0px",
                "&:hover": {
                    color: "white",
                    padding: "0px",
                },
            };
            const styles2 = {
                color: "red",
                "&:hover": {
                    color: "red",
                },
            };
            const styles3 = merge(styles1, styles2);

            expect(styles3.color).toBe("red");
            expect(styles3.margin).toBe("0px");
            expect(styles3["&:hover"].color).toBe("red");
            expect(styles3["&:hover"].padding).toBe("0px");

            // Check if styles1 is not changed
            expect(styles1.color).toBe("white");
            expect(styles1["&:hover"].color).toBe("white");
        });
    });
});
