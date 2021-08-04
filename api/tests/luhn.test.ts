import RandExp from "randexp";
import { isLuhnValid } from "../src/helpers/luhn";
import { randomList } from "./testHelpers/random";

describe("Luhn helper function", () => {
  describe("Pre Conditions", () => {

    const dirtyStrings = randomList(() => new RandExp(/\w{4,20}/).gen(), 20);
    test.each(dirtyStrings)(`Accepts only digits, case %s`, (code) => {
      expect(() => isLuhnValid(code)).toThrow();
    });

    const singleDigitStrings = randomList(() => new RandExp(/\d/).gen(), 20);
    test.each(singleDigitStrings)(`Length must be greater than 1, case %s`, (code) => {
      expect(() => isLuhnValid(code)).toThrow();
    });
  });

  describe("Post Conditions", () => {
    test("Validates checksum correctly", () => {
      expect(isLuhnValid("79927398713")).toBe(true);

      expect(isLuhnValid("79927398710")).toBe(false);
      expect(isLuhnValid("79927398711")).toBe(false);
      expect(isLuhnValid("79927398712")).toBe(false);
      expect(isLuhnValid("79927398714")).toBe(false);
      expect(isLuhnValid("79927398715")).toBe(false);
      expect(isLuhnValid("79927398716")).toBe(false);
      expect(isLuhnValid("79927398717")).toBe(false);
      expect(isLuhnValid("79927398718")).toBe(false);
      expect(isLuhnValid("79927398719")).toBe(false);

      expect(isLuhnValid("59")).toBe(true);

      expect(isLuhnValid("50")).toBe(false);
      expect(isLuhnValid("51")).toBe(false);
      expect(isLuhnValid("52")).toBe(false);
      expect(isLuhnValid("53")).toBe(false);
      expect(isLuhnValid("54")).toBe(false);
      expect(isLuhnValid("55")).toBe(false);
      expect(isLuhnValid("56")).toBe(false);
      expect(isLuhnValid("57")).toBe(false);
      expect(isLuhnValid("58")).toBe(false);

      expect(isLuhnValid("7819147")).toBe(true);

      expect(isLuhnValid("7819140")).toBe(false);
      expect(isLuhnValid("7819141")).toBe(false);
      expect(isLuhnValid("7819142")).toBe(false);
      expect(isLuhnValid("7819143")).toBe(false);
      expect(isLuhnValid("7819144")).toBe(false);
      expect(isLuhnValid("7819145")).toBe(false);
      expect(isLuhnValid("7819146")).toBe(false);
      expect(isLuhnValid("7819148")).toBe(false);
      expect(isLuhnValid("7819149")).toBe(false);
    });
  });
});