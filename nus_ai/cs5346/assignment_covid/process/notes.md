# Nested_tree_map

Additional steps, cleaning done manually to clean up dirty data such as "None" for some countries. Did not merge "Cruise Ship" with "Princess Diamond Cruise Ship" as I was not sure if there were multiple cruise ships involved.

Cleaned up Country names so they can match to Continent, Had to "top up" "country_continent" as it was missing some countries.

Added cruise ships under a continent "Others"


# Manual

Age group preparation - most were sortable. For ranges, we used 0 - 10, 11 - 19, 20-29, 30-39, etc. For non aligned ranges, we placed them in the median age (i.e. 27 - 40 was classified in 30-39, 36-45 was classified as 40-49). One record 18-65, was ignored as it was just an 'adult' age range.