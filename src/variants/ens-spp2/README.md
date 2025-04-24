# ENS SPP2

### Voting algorithm
The included `ens-voting.ts` is a variation of standard Copeland, based on [EP 6.5](https://snapshot.box/#/s:ens.eth/proposal/0x60c95ab69a427ce263f4c3c950df8da1134e96a3e76d139c8dac366271009530). The algorithmic steps to assess the results of the vote are as follows:

1. The vote shall include a manifest which contains metadata for all selections: a "group" value that indicates which entries are from the same provider, a boolean "isEligibleFor2YearFunding" value, and a boolean "isExtended" value which indicates if that choice is a basic budget or an extended budget. The manifest will also include the scoring values for Copeland (usually 2-1-0)

2. Preprocess votes: Based on the above, iterate through every ballot, and any time a project's "extended" budget has been ordered above that project's "basic" budget, move the "basic" budget selection directly above the placement of the "extended" budget option.

3. Handle "None below": Iterate through every ballot, and delete all selections that are ordered below the "None below" selection. This is to ensure these options do not impact the following steps (i.e. after this point, if a selection does not exist in a ballot's choices, then we know it was unranked)

4. Run the Copeland algorithm:

    1. Create a list of all possible matchups between entries

    2. For each matchup, iterate through all ballots and determine which of the choices was ranked higher within each ballot. If neither choice exists (both have been deleted), do nothing. If one choice exists, add the voting power of the ballot to the aggregate for that choice for this matchup. If both options exist, add the voting power of the ballot to the aggregate for the choice that was ranked higher. After iterating through all ballots, the choice with the larger aggregate voting power has a win added to their score (2 points) and the choice with the lower aggregate voting power will have a loss added to their score (0 points). If both choices have the same amount of voting power, they each have a tie added to their scores (1 point each).

    3. After processing all matchups, rank the choices in descending order based on their score (points).

    4. If multiple options have the same score as each other, find each option's total voting power by iterating through all ballots and adding together the voting power of each ballot that ranked that option above "none below". Order the choices in descending order of total voting power as the tiebreaker.

5. We will be left with a list of all selections (including "None below") in order of their final ranking.

### Budget allocation
Once the above results are determined and agreed upon, the budget can be allocated. The total budget is $4.5 million, of which $1.5 million is reserved for the 2-year stream. The remainder will be used for the 1-year stream.

1. Starting at the top of the list and move down

2. If "None below" is reached, the process is finished and all remaining entries will receive no funding.

3. Until then, for each selection:

    1. If the current selection is within the top 10 entries, and the manifest metadata indicates "isEligibleFor2YearFunding" for this selection, and if adding this selection's budget to the total amount already allocated to the 2-year stream would not cause the total to exceed the $1.5 million limit, then add this selection's budget to the 2-year stream.

    2. Otherwise, if adding this selection's budget to the total amount already allocated to the 1-year stream would cause the total budget to exceed the $4.5 million limit, skip this selection. If this selection is an extended budget but the corresponding basic budget did not get funded (because it did not fit within the budget), then skip this selection.

    3. Otherwise, add this selection's budget to the 1-year stream.
