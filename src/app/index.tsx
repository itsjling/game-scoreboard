import { createFileRoute } from "@tanstack/react-router"
import { DialogTrigger } from "@/components/ui/dialog"

import React from "react"
import { useState, useEffect } from "react"
import {
  Plus,
  Settings,
  Trash2,
  ChevronUp,
  ChevronDown,
  Users,
  User,
  History,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  X,
  Trash,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export const Route = createFileRoute("/")({
  component: ScoreTracker,
})

type Player = {
  id: string
  name: string
  color: string
  scores: number[] // Array of scores per round
  team: string | null
}

type Team = {
  id: string
  name: string
  color: string
}

type AppSettings = {
  enableTeams: boolean
  sortBy: "name" | "score-asc" | "score-desc"
  numberOfRounds: number
  currentRound: number
  showPerRoundScores: boolean
}

type Game = {
  id: string
  name: string
  date: string
  players: Player[]
  settings: AppSettings
  teams: Team[]
}

// Random name generator
const adjectives = [
  "Wild",
  "Clever",
  "Mighty",
  "Lucky",
  "Brave",
  "Swift",
  "Jolly",
  "Fierce",
  "Bright",
  "Calm",
  "Eager",
  "Grand",
  "Noble",
  "Royal",
  "Witty",
]

const animals = [
  "Tiger",
  "Eagle",
  "Dolphin",
  "Fox",
  "Owl",
  "Panda",
  "Wolf",
  "Lion",
  "Hawk",
  "Bear",
  "Rabbit",
  "Deer",
  "Koala",
  "Falcon",
  "Turtle",
]

const generateGameName = () => {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const animal = animals[Math.floor(Math.random() * animals.length)]
  return `${adjective}-${animal}`
}

const generateRandomColor = () => {
  const letters = "0123456789ABCDEF"
  let color = "#"
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

function ScoreTracker() {
  const [players, setPlayers] = useState<Player[]>([])
  const [settings, setSettings] = useState<AppSettings>({
    enableTeams: false,
    sortBy: "name",
    numberOfRounds: 0,
    currentRound: 1,
    showPerRoundScores: true,
  })
  const [newPlayerName, setNewPlayerName] = useState("")
  const [newPlayerColor, setNewPlayerColor] = useState(generateRandomColor())
  const [newPlayerTeam, setNewPlayerTeam] = useState<string | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [newTeamName, setNewTeamName] = useState("")
  const [newTeamColor, setNewTeamColor] = useState(generateRandomColor())
  const [gameName, setGameName] = useState(generateGameName())
  const [gameHistory, setGameHistory] = useState<Game[]>([])
  const [currentGameId, setCurrentGameId] = useState<string>(Date.now().toString())
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null)
  const [gameStarted, setGameStarted] = useState(false)

  // Load state from localStorage on initial render
  useEffect(() => {
    const savedState = localStorage.getItem("cardGameState")
    if (savedState) {
      try {
        const { players, settings, teams, gameName, gameHistory, currentGameId, gameStarted } = JSON.parse(savedState) // Added gameStarted
        setPlayers(players)
        setSettings(settings)
        setTeams(teams || [])
        setGameName(gameName)
        setGameHistory(gameHistory || [])
        setCurrentGameId(currentGameId)
        setGameStarted(gameStarted || false) // Load gameStarted state
      } catch (error) {
        console.error("Error loading saved state:", error)
      }
    }
  }, [])

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(
      "cardGameState",
      JSON.stringify({
        players,
        settings,
        teams,
        gameName,
        gameHistory,
        currentGameId,
        gameStarted, // Save gameStarted state
      }),
    )
  }, [players, settings, teams, gameName, gameHistory, currentGameId, gameStarted]) // Added gameStarted to dependency array

  // Get current or total score for a player
  const getPlayerScore = (player: Player): number => {
    if (settings.showPerRoundScores) {
      return player.scores[settings.currentRound - 1] || 0
    } else {
      // Sum scores up to the current round
      return player.scores.slice(0, settings.currentRound).reduce((sum, score) => sum + score, 0)
    }
  }

  // Get team color
  const getTeamColor = (teamId: string | null): string => {
    if (!teamId) return "#000000"
    const team = teams.find((t) => t.id === teamId)
    return team ? team.color : "#000000"
  }

  // Sort players based on settings
  const sortedPlayers = [...players].sort((a, b) => {
    if (settings.sortBy === "name") {
      return a.name.localeCompare(b.name)
    } else if (settings.sortBy === "score-asc") {
      return getPlayerScore(a) - getPlayerScore(b)
    } else {
      return getPlayerScore(b) - getPlayerScore(a)
    }
  })

  // Group players by team if teams are enabled
  const playersByTeam = sortedPlayers.reduce(
    (acc, player) => {
      const teamId = player.team || "no-team"
      if (!acc[teamId]) {
        acc[teamId] = []
      }
      acc[teamId].push(player)
      return acc
    },
    {} as Record<string, Player[]>,
  )

  // Calculate team scores
  const teamScores = Object.entries(playersByTeam).reduce(
    (acc, [teamId, teamPlayers]) => {
      acc[teamId] = teamPlayers.reduce((sum, player) => sum + getPlayerScore(player), 0)
      return acc
    },
    {} as Record<string, number>,
  )

  // Add a new player
  const addPlayer = () => {
    if (newPlayerName.trim()) {
      const newPlayer: Player = {
        id: Date.now().toString(),
        name: newPlayerName,
        color: settings.enableTeams && newPlayerTeam ? getTeamColor(newPlayerTeam) : newPlayerColor,
        scores: Array(settings.currentRound).fill(0),
        team: settings.enableTeams ? newPlayerTeam : null,
      }
      setPlayers([...players, newPlayer])
      setNewPlayerName("")
      setNewPlayerColor(generateRandomColor())
    }
  }

  // Remove a player
  const removePlayer = (id: string) => {
    setPlayers(players.filter((player) => player.id !== id))
  }

  // Update player score
  const updateScore = (id: string, increment: number) => {
    setPlayers(
      players.map((player) => {
        if (player.id === id) {
          const newScores = [...player.scores]
          if (newScores.length < settings.currentRound) {
            // Fill missing rounds with zeros
            newScores.push(...Array(settings.currentRound - newScores.length).fill(0))
          }
          newScores[settings.currentRound - 1] = (newScores[settings.currentRound - 1] || 0) + increment
          return { ...player, scores: newScores }
        }
        return player
      }),
    )
  }

  // Set exact score for a player
  const setExactScore = (id: string, score: number) => {
    setPlayers(
      players.map((player) => {
        if (player.id === id) {
          const newScores = [...player.scores]
          if (newScores.length < settings.currentRound) {
            // Fill missing rounds with zeros
            newScores.push(...Array(settings.currentRound - newScores.length).fill(0))
          }
          newScores[settings.currentRound - 1] = score
          return { ...player, scores: newScores }
        }
        return player
      }),
    )
  }

  // Add a new team
  const addTeam = () => {
    if (newTeamName.trim() && !teams.some((team) => team.name === newTeamName)) {
      const newTeam: Team = {
        id: Date.now().toString(),
        name: newTeamName,
        color: newTeamColor,
      }
      setTeams([...teams, newTeam])
      setNewTeamName("")
      setNewTeamColor(generateRandomColor())
    }
  }

  // Reset all scores for current round
  const resetCurrentRoundScores = () => {
    setPlayers(
      players.map((player) => {
        const newScores = [...player.scores]
        newScores[settings.currentRound - 1] = 0
        return { ...player, scores: newScores }
      }),
    )
  }

  // Navigate to previous round
  const previousRound = () => {
    if (settings.currentRound > 1) {
      setSettings({ ...settings, currentRound: settings.currentRound - 1 })
    }
  }

  // Navigate to next round
  const nextRound = () => {
    if (settings.numberOfRounds === 0 || settings.currentRound < settings.numberOfRounds) {
      // Ensure all players have scores for the new round
      setPlayers(
        players.map((player) => {
          const newScores = [...player.scores]
          if (newScores.length < settings.currentRound + 1) {
            newScores.push(0)
          }
          return { ...player, scores: newScores }
        }),
      )
      setSettings({ ...settings, currentRound: settings.currentRound + 1 })
    }
  }

  // Start a new game
  const startNewGame = () => {
    // Only save current game to history if it has players and isn't already in history
    if (players.length > 0) {
      const existingGameIndex = gameHistory.findIndex((game) => game.id === currentGameId)
      const currentGame: Game = {
        id: currentGameId,
        name: gameName,
        date: new Date().toISOString(),
        players: [...players],
        settings: { ...settings },
        teams: [...teams],
      }

      if (existingGameIndex >= 0) {
        // Update existing game
        const updatedHistory = [...gameHistory]
        updatedHistory[existingGameIndex] = currentGame
        setGameHistory(updatedHistory)
      } else {
        // Add new game
        setGameHistory([...gameHistory, currentGame])
      }
    }

    // Reset for new game
    const newGameId = Date.now().toString()
    setCurrentGameId(newGameId)
    setGameName(generateGameName())
    setPlayers([])
    setTeams([])
    setGameStarted(false)
    setSettings({
      ...settings,
      currentRound: 1,
    })
  }

  // Load a game from history
  const loadGame = (game: Game) => {
    setPlayers(game.players)
    setSettings({
      ...game.settings,
      currentRound: 1,
    })
    setTeams(game.teams || [])
    setGameName(game.name)
    setCurrentGameId(game.id) // Keep the original game ID
    setGameStarted(false) // Reset to edit mode when loading
  }

  // Add a reset entire game function:
  const resetEntireGame = () => {
    setPlayers([])
    setTeams([])
    setGameName(generateGameName())
    setGameStarted(false)
    setSettings({
      enableTeams: false,
      sortBy: "name",
      numberOfRounds: 0,
      currentRound: 1,
      showPerRoundScores: true,
    })
    setCurrentGameId(Date.now().toString())
  }

  // Delete a game from history
  const deleteGame = (id: string) => {
    setGameHistory(gameHistory.filter((game) => game.id !== id))
    if (selectedGameId === id) {
      setSelectedGameId(null)
    }
  }

  // Clear all game history
  const clearAllGames = () => {
    setGameHistory([])
    setSelectedGameId(null)
  }

  // Get team name by ID
  const getTeamName = (teamId: string | null): string => {
    if (!teamId) return "No Team"
    const team = teams.find((t) => t.id === teamId)
    return team ? team.name : "No Team"
  }

  const getPlayerTeam = (player: Player) => {
    const team = teams.find((t) => t.id === player.team) || { color: player.color }
    return team
  }

  // Helper function to sort players for a specific game
  const getSortedPlayersForGame = (gamePlayers: Player[], gameSettings: AppSettings) => {
    return [...gamePlayers].sort((a, b) => {
      if (gameSettings.sortBy === "name") {
        return a.name.localeCompare(b.name)
      } else if (gameSettings.sortBy === "score-asc") {
        const scoreA = a.scores.reduce((sum, score) => sum + score, 0)
        const scoreB = b.scores.reduce((sum, score) => sum + score, 0)
        return scoreA - scoreB
      } else {
        const scoreA = a.scores.reduce((sum, score) => sum + score, 0)
        const scoreB = b.scores.reduce((sum, score) => sum + score, 0)
        return scoreB - scoreA
      }
    })
  }

  // Helper function to group players by team for a specific game
  const getPlayersByTeamForGame = (gamePlayers: Player[], gameTeams: Team[]) => {
    return gamePlayers.reduce(
      (acc, player) => {
        const teamId = player.team || "no-team"
        if (!acc[teamId]) {
          acc[teamId] = []
        }
        acc[teamId].push(player)
        return acc
      },
      {} as Record<string, Player[]>,
    )
  }

  return (
    <div className="container max-w-md mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        {gameStarted ? (
          <h2 className="text-xl font-semibold">{gameName}</h2>
        ) : (
          <div className="flex items-center gap-2 flex-1">
            <Input
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              className="text-xl font-semibold border-none shadow-none p-0 h-auto bg-transparent focus-visible:ring-0"
              placeholder="Game Name"
            />
            <Button variant="ghost" size="icon" onClick={() => setGameName(generateGameName())}>
              <RefreshCw className="h-4 w-4" />
              <span className="sr-only">Generate Name</span>
            </Button>
          </div>
        )}
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <History className="h-4 w-4" />
                <span className="sr-only">History</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl w-[90vw]">
              <DialogHeader>
                <DialogTitle>Score History</DialogTitle>
                <DialogDescription>View scores by round and previous games</DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="rounds">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="rounds">Current Game</TabsTrigger>
                  <TabsTrigger value="games">Previous Games</TabsTrigger>
                </TabsList>

                <TabsContent value="rounds" className="space-y-4">
                  <h3 className="font-medium">Scores by Round</h3>
                  <div className="border rounded-md overflow-x-auto">
                    <table className="w-full min-w-max">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 min-w-[100px]">Player</th>
                          {Array.from({ length: Math.max(settings.currentRound, 1) }, (_, i) => (
                            <th key={i} className="p-2 text-center min-w-[40px]">
                              R{i + 1}
                            </th>
                          ))}
                          <th className="p-2 text-center min-w-[60px]">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {settings.enableTeams ? (
                          // Group by teams
                          <>
                            {teams
                              .filter((team) => playersByTeam[team.id]?.length > 0)
                              .map((team) => (
                                <React.Fragment key={team.id}>
                                  {playersByTeam[team.id]?.map((player) => {
                                    return (
                                      <tr key={player.id} className="border-b">
                                        <td className="p-2 flex items-center">
                                          <div
                                            className="w-3 h-3 rounded-full mr-2"
                                            style={{ backgroundColor: team.color }}
                                          ></div>
                                          {player.name}
                                        </td>
                                        {Array.from({ length: Math.max(settings.currentRound, 1) }, (_, i) => (
                                          <td key={i} className="p-2 text-center">
                                            {player.scores[i] || 0}
                                          </td>
                                        ))}
                                        <td className="p-2 text-center font-bold">
                                          {player.scores.reduce((sum, score) => sum + score, 0)}
                                        </td>
                                      </tr>
                                    )
                                  })}
                                  <tr className="border-b bg-muted/50">
                                    <td className="p-2 font-bold flex items-center">
                                      <div
                                        className="w-3 h-3 rounded-full mr-2"
                                        style={{ backgroundColor: team.color }}
                                      ></div>
                                      {team.name} Total
                                    </td>
                                    {Array.from({ length: Math.max(settings.currentRound, 1) }, (_, i) => (
                                      <td key={i} className="p-2 text-center font-bold">
                                        {playersByTeam[team.id]?.reduce(
                                          (sum, player) => sum + (player.scores[i] || 0),
                                          0,
                                        ) || 0}
                                      </td>
                                    ))}
                                    <td className="p-2 text-center font-bold">{teamScores[team.id] || 0}</td>
                                  </tr>
                                </React.Fragment>
                              ))}
                            {/* No team players */}
                            {playersByTeam["no-team"]?.map((player) => (
                              <tr key={player.id} className="border-b">
                                <td className="p-2 flex items-center">
                                  <div
                                    className="w-3 h-3 rounded-full mr-2"
                                    style={{ backgroundColor: player.color }}
                                  ></div>
                                  {player.name}
                                </td>
                                {Array.from({ length: Math.max(settings.currentRound, 1) }, (_, i) => (
                                  <td key={i} className="p-2 text-center">
                                    {player.scores[i] || 0}
                                  </td>
                                ))}
                                <td className="p-2 text-center font-bold">
                                  {player.scores.reduce((sum, score) => sum + score, 0)}
                                </td>
                              </tr>
                            ))}
                          </>
                        ) : (
                          // Individual players (sorted)
                          sortedPlayers.map((player) => {
                            const team = getPlayerTeam(player)
                            return (
                              <tr key={player.id} className="border-b">
                                <td className="p-2 flex items-center">
                                  <div
                                    className="w-3 h-3 rounded-full mr-2"
                                    style={{ backgroundColor: team.color }}
                                  ></div>
                                  {player.name}
                                </td>
                                {Array.from({ length: Math.max(settings.currentRound, 1) }, (_, i) => (
                                  <td key={i} className="p-2 text-center">
                                    {player.scores[i] || 0}
                                  </td>
                                ))}
                                <td className="p-2 text-center font-bold">
                                  {player.scores.reduce((sum, score) => sum + score, 0)}
                                </td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>

                <TabsContent value="games" className="space-y-4">
                  {gameHistory.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex justify-end">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash className="h-4 w-4 mr-2" />
                              Clear All
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Clear Game History</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete all game history? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={clearAllGames}>Delete All</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>

                      {gameHistory.map((game) => (
                        <div key={game.id} className="space-y-2">
                          <Card
                            className={cn(
                              "cursor-pointer hover:bg-accent",
                              selectedGameId === game.id && "border-primary",
                            )}
                          >
                            <CardContent className="p-4 flex justify-between items-center">
                              <div
                                className="flex-1"
                                onClick={() => setSelectedGameId(selectedGameId === game.id ? null : game.id)}
                              >
                                <div className="font-medium">{game.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {new Date(game.date).toLocaleDateString()} • {game.players.length} players
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => loadGame(game)}
                                  className="text-primary"
                                >
                                  Load
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteGame(game.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>

                          {selectedGameId === game.id && (
                            <div className="mt-4 border rounded-md overflow-x-auto">
                              <table className="w-full min-w-max">
                                <thead>
                                  <tr className="border-b">
                                    <th className="text-left p-2 min-w-[100px]">Player</th>
                                    {Array.from({ length: Math.max(game.settings.currentRound, 1) }, (_, i) => (
                                      <th key={i} className="p-2 text-center min-w-[40px]">
                                        R{i + 1}
                                      </th>
                                    ))}
                                    <th className="p-2 text-center min-w-[60px]">Total</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(() => {
                                    const sortedGamePlayers = getSortedPlayersForGame(game.players, game.settings)
                                    const gamePlayersByTeam = getPlayersByTeamForGame(game.players, game.teams || [])

                                    if (game.settings.enableTeams) {
                                      return (
                                        <>
                                          {(game.teams || [])
                                            .filter((team) => gamePlayersByTeam[team.id]?.length > 0)
                                            .map((team) => (
                                              <React.Fragment key={team.id}>
                                                {getSortedPlayersForGame(
                                                  gamePlayersByTeam[team.id] || [],
                                                  game.settings,
                                                ).map((player) => (
                                                  <tr key={player.id} className="border-b">
                                                    <td className="p-2 flex items-center">
                                                      <div
                                                        className="w-3 h-3 rounded-full mr-2"
                                                        style={{ backgroundColor: team.color }}
                                                      ></div>
                                                      {player.name}
                                                    </td>
                                                    {Array.from(
                                                      { length: Math.max(game.settings.currentRound, 1) },
                                                      (_, i) => (
                                                        <td key={i} className="p-2 text-center">
                                                          {player.scores[i] || 0}
                                                        </td>
                                                      ),
                                                    )}
                                                    <td className="p-2 text-center font-bold">
                                                      {player.scores.reduce((sum, score) => sum + score, 0)}
                                                    </td>
                                                  </tr>
                                                ))}
                                                <tr className="border-b bg-muted/50">
                                                  <td className="p-2 font-bold flex items-center">
                                                    <div
                                                      className="w-3 h-3 rounded-full mr-2"
                                                      style={{ backgroundColor: team.color }}
                                                    ></div>
                                                    {team.name} Total
                                                  </td>
                                                  {Array.from(
                                                    { length: Math.max(game.settings.currentRound, 1) },
                                                    (_, i) => (
                                                      <td key={i} className="p-2 text-center font-bold">
                                                        {gamePlayersByTeam[team.id]?.reduce(
                                                          (sum, player) => sum + (player.scores[i] || 0),
                                                          0,
                                                        ) || 0}
                                                      </td>
                                                    ),
                                                  )}
                                                  <td className="p-2 text-center font-bold">
                                                    {gamePlayersByTeam[team.id]?.reduce(
                                                      (sum, player) =>
                                                        sum + player.scores.reduce((s, score) => s + score, 0),
                                                      0,
                                                    ) || 0}
                                                  </td>
                                                </tr>
                                              </React.Fragment>
                                            ))}
                                          {/* No team players */}
                                          {gamePlayersByTeam["no-team"] &&
                                            getSortedPlayersForGame(gamePlayersByTeam["no-team"], game.settings).map(
                                              (player) => (
                                                <tr key={player.id} className="border-b">
                                                  <td className="p-2 flex items-center">
                                                    <div 
                                                      className="w-3 h-3 rounded-full mr-2" 
                                                      style={{ backgroundColor: player.color }}
                                                    ></div>
                                                    {player.name}
                                                  </td>
                                                  {Array.from(
                                                    { length: Math.max(game.settings.currentRound, 1) },
                                                    (_, i) => (
                                                      <td key={i} className="p-2 text-center">
                                                        {player.scores[i] || 0}
                                                      </td>
                                                    ),
                                                  )}
                                                  <td className="p-2 text-center font-bold">
                                                    {player.scores.reduce((sum, score) => sum + score, 0)}
                                                  </td>
                                                </tr>
                                              ),
                                            )}
                                        </>
                                      )
                                    } else {
                                      return sortedGamePlayers.map((player) => {
                                        const team = game.teams?.find((t) => t.id === player.team)
                                        const displayColor = team ? team.color : player.color
                                        return (
                                          <tr key={player.id} className="border-b">
                                            <td className="p-2 flex items-center">
                                              <div
                                                className="w-3 h-3 rounded-full mr-2"
                                                style={{ backgroundColor: displayColor }}
                                              ></div>
                                              {player.name}
                                            </td>
                                            {Array.from({ length: Math.max(game.settings.currentRound, 1) }, (_, i) => (
                                              <td key={i} className="p-2 text-center">
                                                {player.scores[i] || 0}
                                              </td>
                                            ))}
                                            <td className="p-2 text-center font-bold">
                                              {player.scores.reduce((sum, score) => sum + score, 0)}
                                            </td>
                                          </tr>
                                        )
                                      })
                                    }
                                  })()}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">No previous games</div>
                  )}
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
                <span className="sr-only">Settings</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Game Settings</SheetTitle>
                <SheetDescription>Configure how you want to track scores</SheetDescription>
              </SheetHeader>
              <div className="space-y-6 py-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="accumulated-scores">Show accumulated scores</Label>
                  <Switch
                    id="accumulated-scores"
                    checked={!settings.showPerRoundScores}
                    onCheckedChange={(checked) => setSettings({ ...settings, showPerRoundScores: !checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sort-by">Sort players by</Label>
                  <Select
                    value={settings.sortBy}
                    onValueChange={(value) =>
                      setSettings({ ...settings, sortBy: value as "name" | "score-asc" | "score-desc" })
                    }
                  >
                    <SelectTrigger id="sort-by">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="score-desc">Score (highest first)</SelectItem>
                      <SelectItem value="score-asc">Score (lowest first)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rounds">Number of rounds (0 for unlimited)</Label>
                  <Input
                    id="rounds"
                    type="number"
                    min="0"
                    value={settings.numberOfRounds}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        numberOfRounds: Number.parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div className="space-y-3 pt-4">
                  <Button onClick={resetCurrentRoundScores} variant="outline" className="w-full">
                    Reset Round
                  </Button>
                  <Button onClick={startNewGame} variant="default" className="w-full">
                    New Game
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        Reset Game
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reset Game</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to reset everything? This will clear all players, teams, scores, and
                          settings. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={resetEntireGame}>Reset Everything</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {gameStarted && (
        <div className="flex justify-between items-center mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={previousRound}
            disabled={settings.currentRound <= 1 || !gameStarted}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>

          <div className="text-sm font-medium">
            {settings.numberOfRounds > 0
              ? `Round ${settings.currentRound} of ${settings.numberOfRounds}`
              : `Round ${settings.currentRound}`}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={nextRound}
            disabled={(settings.numberOfRounds > 0 && settings.currentRound >= settings.numberOfRounds) || !gameStarted}
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {!gameStarted && (
        <>
          <div className="flex items-center justify-between mb-4">
            <Label htmlFor="enable-teams">Group players into teams</Label>
            <Switch
              id="enable-teams"
              checked={settings.enableTeams}
              onCheckedChange={(checked) => setSettings({ ...settings, enableTeams: checked })}
            />
          </div>

          {settings.enableTeams && (
            <Card className="mb-4">
              <CardContent className="pt-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    addTeam()
                  }}
                >
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Add New Team</Label>
                      <div className="grid grid-cols-[1fr,auto] gap-2">
                        <Input
                          placeholder="Team name"
                          value={newTeamName}
                          onChange={(e) => setNewTeamName(e.target.value)}
                        />
                        <input
                          type="color"
                          value={newTeamColor}
                          onChange={(e) => setNewTeamColor(e.target.value)}
                          className="w-10 h-10 rounded border cursor-pointer"
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        <Plus className="mr-2 h-4 w-4" /> Add Team
                      </Button>
                    </div>

                    {teams.length > 0 && (
                      <div className="space-y-2">
                        <Label>Current Teams</Label>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {teams.map((team) => (
                            <div key={team.id} className="flex items-center justify-between p-2 border rounded">
                              <div className="flex items-center">
                                <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: team.color }}></div>
                                <span>{team.name}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive"
                                onClick={() => {
                                  setTeams(teams.filter((t) => t.id !== team.id))
                                  // Update players who were in this team
                                  setPlayers(players.map((p) => (p.team === team.id ? { ...p, team: null } : p)))
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Add new player form */}
      {!gameStarted && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                addPlayer()
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-[1fr,auto] gap-2">
                <Input
                  placeholder="Player name"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                />
                {!settings.enableTeams && (
                  <input
                    type="color"
                    value={newPlayerColor}
                    onChange={(e) => setNewPlayerColor(e.target.value)}
                    className="w-10 h-10 rounded border cursor-pointer"
                  />
                )}
              </div>

              {settings.enableTeams && (
                <Select
                  value={newPlayerTeam || "none"}
                  onValueChange={(value) => setNewPlayerTeam(value === "none" ? null : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Team</SelectItem>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: team.color }}></div>
                          {team.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Button type="submit" className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Add Player
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Player list */}
      {settings.enableTeams ? (
        // Display players grouped by teams
        <div className="space-y-6">
          {Object.entries(playersByTeam).map(([teamId, teamPlayers]) => {
            const teamName = getTeamName(teamId === "no-team" ? null : teamId)
            const teamColor = teamId === "no-team" ? "#000000" : getTeamColor(teamId)

            return (
              <div key={teamId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium flex items-center">
                    {teamId === "no-team" ? (
                      <User className="mr-2 h-4 w-4" />
                    ) : (
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: teamColor }}></div>
                        <Users className="mr-2 h-4 w-4" />
                      </div>
                    )}
                    {teamName}
                  </h3>
                  {teamId !== "no-team" && <div className="text-lg font-bold">{teamScores[teamId]}</div>}
                </div>

                {teamPlayers.map((player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    removePlayer={removePlayer}
                    updateScore={updateScore}
                    setExactScore={setExactScore}
                    showTeam={false}
                    currentRound={settings.currentRound}
                    showPerRoundScores={settings.showPerRoundScores}
                    gameStarted={gameStarted}
                    getPlayerScore={getPlayerScore} // Pass getPlayerScore to PlayerCard
                  />
                ))}
              </div>
            )
          })}
        </div>
      ) : (
        // Display players individually
        <div className="space-y-2">
          {sortedPlayers.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              removePlayer={removePlayer}
              updateScore={updateScore}
              setExactScore={setExactScore}
              showTeam={false}
              currentRound={settings.currentRound}
              showPerRoundScores={settings.showPerRoundScores}
              gameStarted={gameStarted}
              getPlayerScore={getPlayerScore} // Pass getPlayerScore to PlayerCard
            />
          ))}
        </div>
      )}

      {/* Start/Edit Game Button */}
      <div className="flex justify-center mt-6">
        <Button
          onClick={() => setGameStarted(!gameStarted)}
          variant={gameStarted ? "outline" : "default"}
          size="lg"
          className="w-full max-w-xs"
        >
          {gameStarted ? "Edit Game" : "Start Game"}
        </Button>
      </div>

      {players.length === 0 && (
        <div className="text-center text-muted-foreground py-8">Add players to start tracking scores</div>
      )}
    </div>
  )
}

function PlayerCard({
  player,
  removePlayer,
  updateScore,
  setExactScore,
  showTeam = false,
  currentRound, // This prop is still passed but getPlayerScore will use settings.currentRound
  showPerRoundScores, // This prop is still passed but getPlayerScore will use settings.showPerRoundScores
  gameStarted,
  // Add getPlayerScore to props
  getPlayerScore,
}: {
  player: Player
  removePlayer: (id: string) => void
  updateScore: (id: string, increment: number) => void
  setExactScore: (id: string, score: number) => void
  showTeam?: boolean
  currentRound: number
  showPerRoundScores: boolean
  gameStarted: boolean
  // Define getPlayerScore in props
  getPlayerScore: (player: Player) => number
}) {
  // Get the current score to display using the passed getPlayerScore function
  const displayScore = getPlayerScore(player)

  const [editableScore, setEditableScore] = useState(displayScore.toString())
  const [isEditing, setIsEditing] = useState(false)

  // Update editable score when display score changes
  useEffect(() => {
    setEditableScore(displayScore.toString())
  }, [displayScore])

  const handleScoreSubmit = () => {
    const newScore = Number.parseInt(editableScore) || 0

    if (showPerRoundScores) {
      // Set the exact score for this round
      setExactScore(player.id, newScore)
    } else {
      // Calculate the difference to update the current round score
      const currentTotal = player.scores.reduce((sum, score) => sum + score, 0)
      const difference = newScore - currentTotal
      updateScore(player.id, difference)
    }

    setIsEditing(false)
  }

  return (
    <Card className={cn("border-l-4")} style={{ borderLeftColor: player.color }}>
      <CardContent className="p-3 flex items-center justify-between">
        <div className="flex-1">
          <div className="font-medium">{player.name}</div>
          {showTeam && player.team && <div className="text-xs text-muted-foreground">{player.team}</div>}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => updateScore(player.id, -1)}
            disabled={!gameStarted}
          >
            <ChevronDown className="h-4 w-4" />
            <span className="sr-only">Decrease</span>
          </Button>

          {isEditing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleScoreSubmit()
              }}
              className="w-16"
            >
              <Input
                type="number"
                value={editableScore}
                onChange={(e) => setEditableScore(e.target.value)}
                className="h-8 text-center p-1"
                autoFocus
                onBlur={handleScoreSubmit}
                disabled={!gameStarted}
              />
            </form>
          ) : (
            <div
              className={cn(
                "w-10 text-center font-bold rounded px-2 py-1",
                gameStarted ? "cursor-pointer hover:bg-accent" : "cursor-not-allowed opacity-50",
              )}
              onClick={() => gameStarted && setIsEditing(true)}
            >
              {displayScore}
            </div>
          )}

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => updateScore(player.id, 1)}
            disabled={!gameStarted}
          >
            <ChevronUp className="h-4 w-4" />
            <span className="sr-only">Increase</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={() => removePlayer(player.id)}
            disabled={gameStarted}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Remove</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
