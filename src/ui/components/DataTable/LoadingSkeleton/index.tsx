'use client'

import { Skeleton, Table } from '@mantine/core'

/**
 * Props for the LoadingSkeleton component.
 */
export type LoadingSkeletonProps = {
  /** Number of skeleton rows to display */
  rows: number
  /** Number of columns in each row */
  columns: number
}

/**
 * Generates deterministic pseudo-random width based on indices.
 * This avoids hydration mismatch between server and client rendering.
 */
function getSkeletonWidth(rowIndex: number, colIndex: number): string {
  // Simple hash-like function to get deterministic but varied widths
  const seed = (rowIndex * 7 + colIndex * 13) % 30
  return `${50 + seed}%`
}

/**
 * Loading skeleton component for DataTable.
 * Displays placeholder rows while data is being fetched.
 */
export function LoadingSkeleton({ rows, columns }: LoadingSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <Table.Tr key={rowIndex}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Table.Td key={colIndex}>
              <Skeleton height={16} width={getSkeletonWidth(rowIndex, colIndex)} />
            </Table.Td>
          ))}
        </Table.Tr>
      ))}
    </>
  )
}
