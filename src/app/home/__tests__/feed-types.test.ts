import { expect, test } from "bun:test";
import { mergeHeadingIntoDescription } from "../feed-types";
test("heading moves into empty description", () => expect(mergeHeadingIntoDescription("Run", "")).toBe("Run"));
test("heading goes in front of existing description", () => expect(mergeHeadingIntoDescription("Run", "5km")).toBe("Run\n5km"));
test("empty heading leaves description alone", () => expect(mergeHeadingIntoDescription("  ", "5km")).toBe("5km"));
