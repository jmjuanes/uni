import {describe, it} from "node:test";
import assert from "node:assert";
import {configure, css, globalCss, keyframes, extractCss, transform, styled} from "./unicss.js";
import {merge, classNames} from "./unicss.js";

configure({
    key: "test/css",
    pragma: (tag, props) => ({tag, props}),
    theme: {
        colors: {
            bg: "styled__bg",
            primary: "__primary",
            secondary: "__secondary",
        },
    },
});

describe("unicss", () => {
    describe("extractCss", () => {
        it("should return the saved styles", () => {
            assert.equal(extractCss(), "");
        });
    });
    describe("css", () => {
        it("should return a valid classname", () => {
            const element = css({
                color: "white",
            });
            const lines = extractCss().split("\n");
            assert.equal(lines[1], `.${element} {color:white;}`);
        });
        it("should apply theme", () => {
            const element = css({
                borderColor: t => t.colors.secondary,
                color: t => `${t.colors.primary}!important`,
            });
            const lines = extractCss().split("\n");
            assert.equal(lines[3], `.${element} {border-color:__secondary;color:__primary!important;}`);
        });
    });
    describe("keyframes", () => {
        it("(keyframes) should parse and generate keyframes", () => {
            const name = keyframes({
                from: {opacity: 0},
                to: {opacity: 1},
            });
            assert.notEqual(name, "");
            assert.ok(extractCss().includes(`@keyframes ${name}`));
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
            assert.ok(styles.includes("html {background-color:white;}"));
            assert.ok(styles.includes("@keyframes test-anim"));
            assert.ok(styles.includes("@font-face {src:source-font1;}"));
            assert.ok(styles.includes("@font-face {src:source-font2;}"));
        });
    });
    describe("styled", () => {
        // it("should call the pragma function", () => {
        //     styled("div", {})({});
        //     expect(pragma).toBeCalledTimes(1);
        // });
        it("should forward props", () => {
            const vnode = styled("div", {})({align: "center"});
            assert.equal(vnode.props.align, "center");
        });
        it("should allow to overwrite 'as' prop", () => {
            const vnode = styled("div", {})({as: "a"});
            assert.equal(vnode.tag, "a");
        });
        it("should concat classNames", () => {
            const vnode = styled("div", {})({className: "test"});
            assert.ok(vnode.props.className.includes("test"));
        });
        it("should support custom themes", () => {
            const vnode = styled("div", {
                backgroundColor: t => t.colors.bg,
            })({});
            assert.ok(vnode.props.className.includes("uni-"));
            assert.ok(extractCss().includes("background-color:styled__bg;"));
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
            assert.ok(extractCss().includes("color:white;font-size:16px;"));
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
            assert.equal(rules[0], ".test {height:1px;width:1px;}");
        });
        it("should apply theme", () => {
            const rules = generateRules({
                ".test": {
                    backgroundColor: t => t.colors.secondary,
                    color: t => t.colors.primary,
                },
            });
            assert.equal(rules[0], ".test {background-color:__secondary;color:__primary;}");
        });
        it("should apply global @media", () => {
            const rules = generateRules({
                "@media (max-width: 0px)": {
                    test: {
                        color: "blue",
                    },
                },
            });
            assert.equal(rules[0], "@media (max-width: 0px) {test {color:blue;}}");
        });
        it("should apply local @media", () => {
            const rules = generateRules({
                test: {
                    "@media (max-width: 0px)": {
                        color: "blue",
                    },
                },
            });
            assert.equal(rules[0], "@media (max-width: 0px) {test {color:blue;}}");
        });
        it("should apply @keyframes", () => {
            const rules = generateRules({
                "@keyframes test": {
                    from: {opacity: 0},
                    to: {opacity: 1},
                },
            });
            assert.equal(rules[0], "@keyframes test {from {opacity:0;} to {opacity:1;}}");
        });
        it("should apply @font-face", () => {
            const rules = generateRules({
                "@font-face": [
                    {src: "source-font1"},
                    {src: "source-font2"},
                ],
            });
            assert.equal(rules[0], "@font-face {src:source-font1;}");
            assert.equal(rules[1], "@font-face {src:source-font2;}");
        });
        it("should apply @import", () => {
            const rules = generateRules({
                "@import": [
                    "source1",
                    "source2",
                ],
            });
            assert.equal(rules[0], "@import source1;");
            assert.equal(rules[1], "@import source2;");
        });
    });
    describe("classNames", () => {
        it("should join arguments into a single string", () => {
            const className = classNames("foo", "bar", "baz");
            assert.equal(className, "foo bar baz");
        });
        it("should add only classes with a truthly value in an object", () => {
            const className = classNames({
                foo: true,
                bar: false,
                baz: true,
            });
            assert.equal(className, "foo baz");
        });
        it("should join all elements in an array", () => {
            const className = classNames(["foo", "bar"], "baz");
            assert.equal(className, "foo bar baz");
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
            assert.equal(styles3.color, "red");
            assert.equal(styles3.margin, "0px");
            assert.equal(styles3["&:hover"].color, "red");
            assert.equal(styles3["&:hover"].padding, "0px");
            // Check if styles1 is not changed
            assert.equal(styles1.color, "white");
            assert.equal(styles1["&:hover"].color, "white");
        });
    });
});
