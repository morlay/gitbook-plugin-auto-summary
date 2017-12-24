## gitbook-plugin-auto-summary

Plugin for gitbook to automate generate SUMMARY.md


### Rules

* Sorted by filename
* Ignore files which are with prefix `_`
* Pick first heading text as title 
* Parts can be defined in `book.json`

### How to use 

```json
{
    "plugins": ["auto-summary"],
    "pluginsConfig": {
      "auto-summary": {
        "parts": { 
           "README.md": "Part I",
           "parts_2/**/*.md": "Part II"
        }      
      }
    }
}
```

will be 

```md

* [others](others/README.md)

## Part I

* [xxx](README.md)

## Part II

* [parts_2](parts_2/README.md)

```