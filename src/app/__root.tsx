import type { ReactNode } from 'react'
import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'

import appCss from './globals.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Scoreboard',
      },
      {
        name: 'description',
        content: 'Keep score like a pro',
      },
      {
        name: 'generator',
        content: 'v0.dev',
      },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="dba2183e-32b7-4fda-832c-653c1ffe1818"
        />
      </head>
      <body>
        <h1 className="text-3xl font-medium text-center mt-5 mb-5">Scoreboard</h1>
        {children}
        <footer className="text-sm text-center mb-5 mt-5 text-neutral-400">
          &copy; {new Date().getFullYear()} Justin Ling. All rights reserved
        </footer>
        <Scripts />
      </body>
    </html>
  )
}
