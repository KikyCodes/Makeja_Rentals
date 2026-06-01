import { formatPrice, formatPropertyType, slugify } from "@/lib/utils";

describe("formatPrice", () => {
  it("formats whole KES amounts correctly", () => {
    expect(formatPrice(8000)).toBe("KES 8,000");
    expect(formatPrice(12500)).toBe("KES 12,500");
    expect(formatPrice(100)).toBe("KES 100");
  });

  it("does not show decimals", () => {
    expect(formatPrice(8000.99)).not.toContain(".");
  });
});

describe("formatPropertyType", () => {
  it("returns human-readable labels", () => {
    expect(formatPropertyType("hostel")).toBe("Hostel");
    expect(formatPropertyType("one_bedroom")).toBe("1 Bedroom");
    expect(formatPropertyType("two_bedroom")).toBe("2 Bedrooms");
    expect(formatPropertyType("shared_room")).toBe("Shared Room");
  });

  it("returns the raw value for unknown types", () => {
    expect(formatPropertyType("unknown_type")).toBe("unknown_type");
  });
});

describe("slugify", () => {
  it("converts spaces to hyphens", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("removes special characters", () => {
    expect(slugify("Machakos Town!")).toBe("machakos-town");
  });

  it("lowercases all characters", () => {
    expect(slugify("MAKEJA RENTALS")).toBe("makeja-rentals");
  });
});
