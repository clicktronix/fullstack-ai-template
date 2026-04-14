import React, { ComponentType, memo } from 'react'

type Hook<P, R> = (properties: P) => R

/**
 * P: Props of the View component
 * E: ExtraProps awaited by hooks (usually props that are not defined in the original Component but needed by hooks)
 * */
export function composeHooks<P, E>(Component: ComponentType<P>) {
  return function <H1, H2, H3, H4, H5>(
    hook1?: Hook<P & E, H1>,
    hook2?: Hook<H1 & P & E, H2>,
    hook3?: Hook<H1 & H2 & P & E, H3>,
    hook4?: Hook<H1 & H2 & H3 & P & E, H4>,
    hook5?: Hook<H1 & H2 & H3 & H4 & P & E, H5>
  ) {
    function ComposedComponent(
      props: Omit<P, keyof H1 | keyof H2 | keyof H3 | keyof H4 | keyof H5> &
        Omit<Partial<H1 & H2 & H3 & H4 & H5>, keyof E> &
        E & { ref?: React.Ref<unknown> }
    ) {
      const { ref, ...restProps } = props
      const hookResults1 = hook1 ? hook1(restProps as P & E) : ({} as H1)
      const hookResults2 = hook2
        ? hook2({ ...restProps, ...hookResults1 } as H1 & P & E)
        : ({} as H2)
      const hookResults3 = hook3
        ? hook3({ ...restProps, ...hookResults1, ...hookResults2 } as H1 & H2 & P & E)
        : ({} as H3)
      const hookResults4 = hook4
        ? hook4({
            ...restProps,
            ...hookResults1,
            ...hookResults2,
            ...hookResults3,
          } as H1 & H2 & H3 & P & E)
        : ({} as H4)
      const hookResults5 = hook5
        ? hook5({
            ...restProps,
            ...hookResults1,
            ...hookResults2,
            ...hookResults3,
            ...hookResults4,
          } as H1 & H2 & H3 & H4 & P & E)
        : ({} as H5)

      const combinedProps = {
        ...restProps,
        ...hookResults1,
        ...hookResults2,
        ...hookResults3,
        ...hookResults4,
        ...hookResults5,
        ref,
      }

      return <Component {...(combinedProps as unknown as P & React.Attributes)} />
    }

    ComposedComponent.displayName = `Composed(${Component.displayName || Component.name || 'Component'})`

    const Memoized = memo(ComposedComponent) as typeof ComposedComponent
    Memoized.displayName = ComposedComponent.displayName

    return Memoized
  }
}
