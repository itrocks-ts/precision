[![npm version](https://img.shields.io/npm/v/@itrocks/precision?logo=npm)](https://www.npmjs.org/package/@itrocks/precision)
[![npm downloads](https://img.shields.io/npm/dm/@itrocks/precision)](https://www.npmjs.org/package/@itrocks/precision)
[![GitHub](https://img.shields.io/github/last-commit/itrocks-ts/precision?color=2dba4e&label=commit&logo=github)](https://github.com/itrocks-ts/precision)
[![issues](https://img.shields.io/github/issues/itrocks-ts/precision)](https://github.com/itrocks-ts/precision/issues)
[![discord](https://img.shields.io/discord/1314141024020467782?color=7289da&label=discord&logo=discord&logoColor=white)](https://25.re/ditr)

# precision

@Precision decorator to define fixed or adaptive decimal precision for numeric values.

*This documentation was written by an artificial intelligence and may contain errors or approximations.
It has not yet been fully reviewed by a human. If anything seems unclear or incomplete,
please feel free to contact the author of this package.*

## Installation

```bash
npm i @itrocks/precision
```

## Usage

`@itrocks/precision` provides a property decorator `@Precision()` that lets you
describe how many decimal places should be used when displaying or formatting a
numeric property.

The decorator itself does not perform any rounding. Instead, it stores
metadata (minimum and maximum number of fraction digits) that other parts of
the framework – or your own code – can use to format values consistently.

You can read this metadata using the helper function `precisionOf`, for
instance to configure number formatting in a UI or reporting layer.

### Minimal example

```ts
import { Precision } from '@itrocks/precision'

class Product {
  // Price with exactly 2 decimal places (e.g. 10.00, 19.95)
  @Precision(2)
  price = 0
}
```

Here, the `price` property is marked as having a precision of 2 decimal
places. Any formatter that reads the decorator metadata can make sure values
are displayed accordingly.

### Complete example with formatting

This package is typically used together with other `@itrocks/*` components
that know how to read the precision metadata and format numbers. The following
example shows a simplified, standalone usage:

```ts
import type { ObjectOrType } from '@itrocks/class-type'
import { Precision, precisionOf } from '@itrocks/precision'

class InvoiceLine {
  // Quantity with up to 3 decimal places (e.g. 1, 1.5, 1.375)
  @Precision(0, 3)
  quantity = 0

  // Unit price with exactly 2 decimal places
  @Precision(2)
  unitPrice = 0
}

function formatNumber<T extends object>(
  value: number,
  type: ObjectOrType<T>,
  property: keyof T
): string {
  const precision = precisionOf(type, property)

  return value.toLocaleString('en-US', {
    minimumFractionDigits: precision.minimum,
    maximumFractionDigits: precision.maximum
  })
}

const line = new InvoiceLine()
line.quantity  = 1.375
line.unitPrice = 19.9

// "1.375" (up to 3 decimals)
const quantityText  = formatNumber(line.quantity, InvoiceLine, 'quantity')

// "19.90" (fixed 2 decimals)
const unitPriceText = formatNumber(line.unitPrice, InvoiceLine, 'unitPrice')
```

In real applications, you will usually rely on helpers provided by
`@itrocks/core-transformers` or similar packages, which already integrate
`precisionOf` when generating HTML inputs or formatting numeric values.

## API

### `const WHOLE: PrecisionType`

Default precision used when no `@Precision()` decorator is found on a
property.

It represents whole numbers, with both `minimum` and `maximum` fraction
digits equal to `0`.

#### Shape

- `minimum: number` – minimum number of fraction digits (here `0`).
- `maximum: number` – maximum number of fraction digits (here `0`).

You normally do not use `WHOLE` directly; it is mainly useful if you need a
constant describing integer precision or want to replicate the default
behaviour of `precisionOf`.

---

### `interface PrecisionType`

Represents the precision configuration stored by the decorator.

#### Properties

- `minimum: number` – minimum number of fraction digits to display.
- `maximum: number` – maximum number of fraction digits to display.

---

### `function Precision<T extends object>(minimum: number, maximum?: number): DecorateCaller<T>`

Property decorator used to declare the decimal precision of a numeric field.

#### Parameters

- `minimum` – minimum number of fraction digits.
- `maximum` *(optional)* – maximum number of fraction digits. If omitted,
  the `maximum` is set to the same value as `minimum`, resulting in a fixed
  number of decimal places.

#### Return value

- `DecorateCaller<T>` – function from `@itrocks/decorator/property` used by the
  TypeScript decorator system. In practice, you just apply `@Precision()` on a
  property and do not call this function directly.

#### Examples

```ts
class Account {
  // Exactly 2 decimals (e.g. 100.00)
  @Precision(2)
  balance = 0

  // Between 0 and 4 decimals (e.g. 3, 3.1, 3.1416)
  @Precision(0, 4)
  interestRate = 0
}
```

---

### `function precisionOf<T extends object>(target: ObjectOrType<T>, property: KeyOf<T>): PrecisionType`

Retrieves the precision configuration attached to a given property through the
`@Precision()` decorator.

If the property is not decorated, it returns `WHOLE`, meaning an integer
precision (`minimum = 0`, `maximum = 0`).

#### Parameters

- `target` – the class (e.g. `InvoiceLine`) or instance (`new InvoiceLine()`) that
  owns the property.
- `property` – the name of the property whose precision you want to read.

#### Return value

- `PrecisionType` – object containing `minimum` and `maximum` fraction digits.

#### Example

```ts
import type { ObjectOrType } from '@itrocks/class-type'
import { Precision, precisionOf } from '@itrocks/precision'

class Measure {
  @Precision(0, 3)
  length = 0
}

function getPrecision<T extends object>(
  type: ObjectOrType<T>,
  property: keyof T
): { min: number; max: number } {
  const { minimum, maximum } = precisionOf(type, property)
  return { min: minimum, max: maximum }
}

// { min: 0, max: 3 }
const lengthPrecision = getPrecision(Measure, 'length')
```

## Typical use cases

- Mark numeric properties in your domain models with the expected number of
  decimal places for consistent formatting across your application.
- Configure how numbers are displayed in forms, tables and reports by reading
  precision metadata instead of hard‑coding formatting rules.
- Integrate with transformer libraries (such as `@itrocks/core-transformers`)
  so that HTML inputs and outputs automatically respect the declared
  precision.
- Distinguish between integers and decimal quantities at the model level
  without changing the underlying TypeScript type (`number`).
- Centralize formatting rules close to your data model using decorators,
  keeping UI and persistence layers simpler.
