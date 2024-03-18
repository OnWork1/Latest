interface PaginationOffset {
  skip: number;
  take: number;
}

export default function getSkipTake(
  perPage?: number,
  page?: number
): PaginationOffset {
  let skip: number = 0;
  const { defaultPageLimit } = useRuntimeConfig();
  let take = defaultPageLimit;

  if (perPage) {
    take = perPage;
  }

  if (page) {
    skip = (page - 1) * take;
  }

  return { skip: skip, take: take };
}
