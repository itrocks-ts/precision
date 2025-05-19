import { KeyOf, ObjectOrType }   from '@itrocks/class-type'
import { decorate, decoratorOf } from '@itrocks/decorator/property'

const PRECISION = Symbol('precision')

export const WHOLE = { minimum: 0, maximum: 0 }

export interface PrecisionType
{
	maximum: number,
	minimum: number
}

export function Precision<T extends object>(minimum: number, maximum?: number)
{
	if (maximum === undefined) {
		maximum = minimum
	}
	return decorate<T>(PRECISION, { minimum, maximum })
}

export function precisionOf<T extends object>(target: ObjectOrType<T>, property: KeyOf<T>)
{
	return decoratorOf<PrecisionType, T>(target, property, PRECISION, WHOLE)
}
