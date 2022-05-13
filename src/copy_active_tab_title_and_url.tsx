import { useEffect, useState } from "react";
import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { runAppleScript } from "run-applescript";

interface Link {
  text: string | null
  url: string | null
}

export default function Command() {
  const [link, setLink] = useState<Link>({
    text: null,
    url: null,
  })
  const [isLoading, setIsLoading] = useState(true)

  getFrontMostBrowserTitleAndUrl().then(titleAndUrl => {
    builldLink(titleAndUrl)
  })

  useEffect(() => {
    if(link.text){
      setIsLoading(false)
    }
  }, [link]);

  async function getFrontMostBrowserTitleAndUrl(): Promise<string>{
    const titleAndUrl = await runAppleScript(`
      tell application "System Events" to set frontApp to name of first process whose frontmost is true

      if (frontApp = "Google Chrome") or (frontApp = "Google Chrome Canary") or (frontApp = "Chromium") or (frontApp = "Opera") or (frontApp = "Vivaldi") or (frontApp = "Brave Browser") then
        using terms from application "Google Chrome"
          tell application frontApp to set currentTabTitle to title of active tab of front window
          tell application frontApp to set currentTabUrl to URL of active tab of front window
        end using terms from
      else if (frontApp = "Safari") or (frontApp = "Safari Technology Preview") or (frontApp = "Webkit") then
        using terms from application "Safari"
          tell application frontApp to set currentTabTitle to name of front document
          tell application frontApp to set currentTabUrl to URL of front document
        end using terms from
      else
        return "You need a browser as your frontmost app"
      end if

      return currentTabTitle & "\n" & currentTabUrl
    `)

    return titleAndUrl
  }

  const builldLink = (originText: string) => {
    const linkTitleAndUrl = originText.split('\n')
    setLink({
      text: linkTitleAndUrl[0],
      url: linkTitleAndUrl[1],
    })
  }

  return (
    <List
      isLoading={isLoading}
      throttle={true}
    >
      <List.Item
        id={"inMarkdown"}
        key={"inMarkdown"}
        title={'Copy to clipboard in markdown format'}
        subtitle={link.text || ''}
        icon={Icon.Clipboard}
        actions={
          <ActionPanel>
            <ActionPanel.Section>
              <Action.CopyToClipboard
                content={`[${link.text}](${link.url})`}
              />
            </ActionPanel.Section>
          </ActionPanel>
        }
      />
    </List>
  )
}
