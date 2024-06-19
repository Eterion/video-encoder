# h264-encoder

> Requires **ffmpeg** to be on your system.

A [nodejs](https://nodejs.org/en) program that encodes video to h264 and removes non-japanese audio tracks and non-english subtitles.

```shell
# Install dependencies
npm ci

# Start program
npm start
```

You will be prompted for the following

- Select a drive
- Navigate through file system to select directory
- Select file extension to process
- Select files to process (shows track information)
- Do you want to modify the tracks to be kept?
- Encode video to H.264?
- Do you want to proceed with processing?
