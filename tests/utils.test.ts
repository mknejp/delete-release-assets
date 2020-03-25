import { parse_assets, matches_any } from "../src/utils";

describe("utils", () => {
  describe("parse_assets", () => {

    test("empty string produces empty result", () => {
      expect(parse_assets('')).toHaveLength(0);
    });

    test("empty multiline string produces empty result", () => {
      expect(parse_assets("\n")).toHaveLength(0);
      expect(parse_assets("\r\n")).toHaveLength(0);
      expect(parse_assets("\n\n")).toHaveLength(0);
      expect(parse_assets("\r\n\n")).toHaveLength(0);
      expect(parse_assets("\r\n\r\n")).toHaveLength(0);
    });

    test("string with one line produces one element", () => {
      expect(parse_assets("a")).toEqual(["a"]);
    });

    test("multiline string is split into array", () => {
      expect(parse_assets("a\nb")).toEqual(["a", "b"]);
      expect(parse_assets("a\r\nb")).toEqual(["a", "b"]);
      expect(parse_assets("a\nb\nc")).toEqual(["a", "b", "c"]);
    });

    test("empty lines are removed", () => {
      expect(parse_assets("\na\n\nb\n")).toEqual(["a", "b"]);
    });

    test("lines are trimmed", () => {
      expect(parse_assets(" a \n b ")).toEqual(["a", "b"]);
    });
  });

  describe("matches_any", () => {
    
    test("direct match", () => {
      expect(matches_any("foo.txt", ["foo.txt"])).toBe(true);
    });
    
    test("no match", () => {
      expect(matches_any("foo.txt", ["bar.txt"])).toBe(false);
    });
    
    test("at least one match", () => {
      expect(matches_any("foo.txt", ["bar.txt", "foo.txt"])).toBe(true);
    });
    
    test("full glob", () => {
      expect(matches_any("foo.txt", ["*"])).toBe(true);
    });
    
    test("partial glob", () => {
      expect(matches_any("foo.txt", ["foo.*"])).toBe(true);
      expect(matches_any("foo.txt", ["foo*"])).toBe(true);
      expect(matches_any("foo.txt", ["foo.txt*"])).toBe(true);
      expect(matches_any("foo.txt", ["*foo.txt"])).toBe(true);
    });
    
    test("multi glob", () => {
      expect(matches_any("foo.txt", ["*.*"])).toBe(true);
      expect(matches_any("foo.txt", ["*oo*"])).toBe(true);
    });
    
    test("no substring match", () => {
      expect(matches_any("foo.txt", ["foo"])).toBe(false);
    });
    
    test("whitespace match", () => {
      expect(matches_any("foo bar.txt", ["*.txt"])).toBe(true);
    });
  })
});