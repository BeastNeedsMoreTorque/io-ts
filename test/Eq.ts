import * as assert from 'assert'
import * as E from '../src/Eq'
import { Eq } from 'fp-ts/lib/Eq'

describe('Eq', () => {
  it('literals', () => {
    const eq = E.literals(['a', null])
    assert.deepStrictEqual(eq.equals('a', 'a'), true)
    assert.deepStrictEqual(eq.equals(null, null), true)
    assert.deepStrictEqual(eq.equals('a', null), false)
  })

  it('literalsOr', () => {
    const eq = E.literalsOr([undefined], E.string)
    assert.deepStrictEqual(eq.equals('a', 'a'), true)
    assert.deepStrictEqual(eq.equals(undefined, undefined), true)
    assert.deepStrictEqual(eq.equals('a', 'b'), false)
    assert.deepStrictEqual(eq.equals('a', undefined), false)
  })

  it('UnknownArray', () => {
    const eq = E.UnknownArray
    assert.deepStrictEqual(eq.equals(['a'], ['a']), true)
    assert.deepStrictEqual(eq.equals(['a'], ['b']), true)
    assert.deepStrictEqual(eq.equals(['a'], ['a', 'b']), false)
  })

  it('refinement', () => {
    const eq = E.refinement(E.string, (s): s is 'a' | 'b' => s === 'a' || s === 'b', '"a" | "b"')
    assert.deepStrictEqual(eq.equals('a', 'a'), true)
    assert.deepStrictEqual(eq.equals('b', 'b'), true)
    assert.deepStrictEqual(eq.equals('a', 'b'), false)
  })

  it('partial', () => {
    const eq = E.partial({ a: E.number })
    assert.deepStrictEqual(eq.equals({ a: 1 }, { a: 1 }), true)
    assert.deepStrictEqual(eq.equals({ a: undefined }, { a: undefined }), true)
    assert.deepStrictEqual(eq.equals({}, { a: undefined }), true)
    assert.deepStrictEqual(eq.equals({}, {}), true)
    assert.deepStrictEqual(eq.equals({ a: 1 }, {}), false)
  })

  it('tuple', () => {
    const eq = E.tuple([E.string, E.number])
    assert.deepStrictEqual(eq.equals(['a', 1], ['a', 1]), true)
    assert.deepStrictEqual(eq.equals(['a', 1], ['b', 1]), false)
    assert.deepStrictEqual(eq.equals(['a', 1], ['a', 2]), false)
  })

  it('intersection', () => {
    const eq = E.intersection([E.type({ a: E.string }), E.type({ b: E.number })])
    assert.deepStrictEqual(eq.equals({ a: 'a', b: 1 }, { a: 'a', b: 1 }), true)
    assert.deepStrictEqual(eq.equals({ a: 'a', b: 1 }, { a: 'c', b: 1 }), false)
    assert.deepStrictEqual(eq.equals({ a: 'a', b: 1 }, { a: 'a', b: 2 }), false)
  })

  it('lazy', () => {
    interface Rec {
      a: number
      b: Array<Rec>
    }

    const eq: Eq<Rec> = E.lazy(() =>
      E.type({
        a: E.number,
        b: E.array(eq)
      })
    )
    assert.strictEqual(eq.equals({ a: 1, b: [] }, { a: 1, b: [] }), true)
    assert.strictEqual(eq.equals({ a: 1, b: [{ a: 2, b: [] }] }, { a: 1, b: [{ a: 2, b: [] }] }), true)
    assert.strictEqual(eq.equals({ a: 1, b: [] }, { a: 2, b: [] }), false)
    assert.strictEqual(eq.equals({ a: 1, b: [{ a: 2, b: [] }] }, { a: 1, b: [{ a: 3, b: [] }] }), false)
  })
})
