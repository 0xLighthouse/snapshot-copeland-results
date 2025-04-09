import type { Ballot } from '../../types'

export const cleanVotes = (votes: Ballot[], notBelow?: number) => {
  return votes.map((vote) => {
    const index = notBelow ? vote.choice.indexOf(notBelow) : vote.choice.length
    return {
      ...vote,
      choice: vote.choice.slice(0, index),
    }
  })
}
