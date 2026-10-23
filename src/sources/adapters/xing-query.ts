export const XING_JOB_SEARCH_QUERY = `
  query JobSearchByQuery(
    $query: JobSearchQueryInput!
    $consumer: String!
    $limit: Int
    $offset: Int
    $searchMode: SearchMode
  ) {
    jobSearchByQuery(
      query: $query
      consumer: $consumer
      limit: $limit
      offset: $offset
      searchMode: $searchMode
    ) {
      total
      collection {
        jobDetail {
          __typename

          ... on VisibleJob {
            id
            title
            url

            companyInfo {
              companyNameOverride
            }

            location {
              city
            }

            summary: summaryV2 {
              content {
                keyResponsibilities
              }
            }
          }
        }
      }
    }
  }
`;
