---
title: Local channels and regions used on Salish Mesh
layout: how-to.njk
date: Last Modified
permalink: /how-to/local-channels/
eleventyNavigation:
  key: Local Channels
  parent: How-To
---

## What are local channels?

Local channels are usually in the form of hashtag channels. These are an easy
way to share a private channel with others. It is important to remember that
anyone can join the channel if they use the same hashtag, i.e. `#test`.

That said it's easy to tell someone over the mesh, `hey join #southisland`, and
they will be able to click the tag and join the channel.

### Channels in use around the Salish Mesh area

- `#salishmesh`: general discussion, operators
- `#bc`: regional general discussion
- `#southisland`: greater Victoria area users and operators
- `#vancouver`
- `#ubc`
- `#bot-van`: some users in Vancouver operate a number of bots available here
- `#testing`: if you want to test you new setup or play with bots
- `#emergency`: reserved for emergency notification. Shared across PNW

### How to add them

If you see a hashtag in chat using the official app you can click it to join the
channel.

Otherwise you can join or even create your own:

- Liam's App: click the three dot menu, top right, and click `add channel`
 then `join a hashtag channel`.
- Meshcore Open: Navigate to the channels page, click the plus button, then
 `join a hashtag channel`.

## What are regions?

Regions are named scopes for traffic.

A user can optionally scope their traffic for a given channel to a region.

What this means is if a user say's scope the public channel to the region `#bc`,
then only repeaters who explicitly allow flood traffic scoped the `#bc` will
forward that traffic. In this way users and repeater operators can limit the
area to which certain traffic will flood to.

### Regions in use around the Salish Mesh Area

It's very early days and most repeaters still allow un-scoped flood traffic,
which means you don't need to scope traffic yet. That said, a number of repeater
owners have begun to experiment with regions and so far the following are
allowed: `#bc`, `#swbc`, `#southisland` and `#salishmesh` but this one might
not make sense with the others already covering most of it.

### How to add a scope to a channel

You can use anything you like for a scope, so you can have local area scopes
between friends or neighboring repeaters etc. The scope may start with a `#`, it
is case-insensitive and must only contain: letters, numbers and the symbols `-`
`$` and `#`.

- Liam's App: click the three dot menu, top right, and click `Set Region Scope`
 then add a scope if the one you want is not listed, otherwise click the scope
 you want to set. To remove the scope you can click the header where it shows
 the current scope and set it to `none`.
- Meshcore Open: coming soon
