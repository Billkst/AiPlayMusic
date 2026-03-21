const MAX_TURNS = 3

export class TurnController {
  private _currentTurn = 0
  private _rejectedIds: string[] = []

  get currentTurn(): number {
    return this._currentTurn
  }

  get shouldForceRecommend(): boolean {
    return this._currentTurn >= MAX_TURNS
  }

  get rejectedIds(): string[] {
    return [...this._rejectedIds]
  }

  recordUserTurn(): void {
    this._currentTurn++
  }

  addRejectedIds(ids: string[]): void {
    this._rejectedIds.push(...ids)
  }

  reset(): void {
    this._currentTurn = 0
    this._rejectedIds = []
  }

  resetForNewVibe(): void {
    this._currentTurn = 0
  }
}
