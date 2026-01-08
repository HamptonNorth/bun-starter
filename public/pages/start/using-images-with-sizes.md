---
title: Using images in markdown and controlling the size
summary: Using Images markdown - this time with size control using the img tag
created: 2025-12-21T10:25:00-00:00
published: y
file-type: markdown
style: github
sticky: false
---

# Using images markdown

This a good link for an explanation [DigitalOcean](https://www.digitalocean.com/community/tutorials/markdown-markdown-images)

The easiest way to control the size of an image is to warp it in an `<img>` HTML tag. The syntax is:

```html
<img title="Redmug logo" alt="redmug logo" src="/media/start/redmug_logo_316x316.png" style="width: 80px; height: 80px;">
```

This will be rendered as:
<img title="Redmug logo" alt="Redmug logo" src="/media/start/redmug_logo_316x316.png" style="width: 80px; height: 80px;">

. . . and making the Orosay image 300px wide
```html

<img title="Sunset at Oronsay near Tobermory" 
  alt="Sunset at Oronsay near Tobermory" 
  src="/media/start/sunset_near_oronsay.png" 
  style="width: 300px; ">                    # only one dimension avoids distortion

```
This will be rendered as:



<img title="Sunset at Oronsay near Tobermory" alt="Sunset at Oronsay near Tobermory" src="/media/start/sunset_near_oronsay.png" style="width: 300px; ">

> When both dimensions are provided as below, the image is distorted.  

<img title="Sunset at Oronsay near Tobermory" alt="Sunset at Oronsay near Tobermory" src="/media/start/sunset_near_oronsay.png" style="width: 300px; height: 100px;">
The two example images above use relative referencing with the images stored locally on the server. 

External images are also supported by using the complete url. In the browser, right click and `Copy image address` is your friend for this. Here is another example. This show the demonstration image from picsum photos. The heighth is set to 160px, the image is centered, bordered and has vertical padding.

```markdown
![A demonstration image](https://picsum.photos/seed/demo1/800/400)
```
This will be rendered as:

![A demonstration image](https://picsum.photos/seed/demo1/800/400)

```html

<div style="text-align: center; padding-top: 12px; padding-bottom: 32px">
    <img title="A demonstration image" 
    src="https://picsum.photos/seed/demo1/800/400" 
    style="display: block; margin: 0 auto; height: 200px; border:solid; border-color:navy">
</div>

```
This will be rendered as:
<div style="text-align: center; padding-top: 12px; padding-bottom: 32px">
    <img title="A demonstration image" 
    src="https://picsum.photos/seed/demo1/800/400" 
    style="display: block; margin: 0 auto; height: 200px; border:solid; border-color:navy">
</div>


Notice the semi-colons between the inline CSS `selectors:property` pairs. 

That's enough inline styling.
