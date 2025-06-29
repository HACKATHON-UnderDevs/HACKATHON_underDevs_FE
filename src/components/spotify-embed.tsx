import { useState } from "react"
import { Spotify } from "react-spotify-embed"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { MusicIcon } from "lucide-react"

export function SpotifyEmbed() {
  const [playlistUrl, setPlaylistUrl] = useState(
    "https://open.spotify.com/track/3yLzD4HMsn8umpbck5ex44?si=089e342b485d461e"
  )
  const [inputUrl, setInputUrl] = useState(
    "https://open.spotify.com/track/3yLzD4HMsn8umpbck5ex44?si=089e342b485d461e"
  )

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const url = new URL(inputUrl)
      if (
        url.hostname === "open.spotify.com" &&
        (url.pathname.includes("/playlist/") ||
          url.pathname.includes("/album/") ||
          url.pathname.includes("/track/"))
      ) {
        setPlaylistUrl(inputUrl)
      } else {
        // Maybe show an error message to the user
        console.error("Invalid Spotify URL")
      }
    } catch (error) {
      // Maybe show an error message to the user
      console.error("Invalid URL format")
    }
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          Focus Music
        </p>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon">
              <MusicIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Spotify Playlist</h4>
                  <p className="text-sm text-muted-foreground">
                    Paste a link to a playlist, album, or track.
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="spotify-url">URL</Label>
                  <Input
                    id="spotify-url"
                    value={inputUrl}
                    onChange={e => setInputUrl(e.target.value)}
                    placeholder="https://open.spotify.com/..."
                  />
                </div>
                <Button type="submit">Load</Button>
              </div>
            </form>
          </PopoverContent>
        </Popover>
      </div>

      <Spotify wide link={playlistUrl} />
    </div>
  )
} 