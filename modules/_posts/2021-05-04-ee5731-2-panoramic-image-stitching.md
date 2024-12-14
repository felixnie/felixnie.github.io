---
layout: post
title: EE5731 - Panoramic Image Stitching
description: >
  SIFT is an algorithm from the paper *Distinctive Image Features from Scale-Invariant Keypoints*, published by David G. Lowe in 2004. The solution for one of its application, image stitching, is proposed in *Automatic Panoramic Image Stitching using Invariant Features*, by Matthew Brown and David G. Lowe in 2017. The continuous assessment 1 of Visual Computing is based on these two papers.
image: /assets/img/img-ee5731/image-stitching-bg.png
sitemap: false
categories: [modules]
tags: [modules]
---

* this unordered seed list will be replaced by the toc
{:toc}

## 3. Scale Invariant Feature Transform (SIFT) Algorithm

It's the third feature detection algorithm introduced in the module EE5731. Here is an overview and the contents of the module: [An Overview of EE5731 Visual Computing]({{ site.baseurl }}{% link modules/_posts/2021-05-09-ee5731-0-an-overview-of-visual-computing.md %}).

The paper [*Distinctive Image Features from Scale-Invariant Keypoints*](https://people.eecs.berkeley.edu/~malik/cs294/lowe-ijcv04.pdf) was first published in 1999 and attained perfection in 2004, by David Lowe from UBC. Although there is *Scale-Invariant* in its title, the features in SIFT are way more powerful than this. They are invariant to image rotation, illumination change, and partially invariant to 3D camera viewpoint.

The paper is well written, starting from theories and ending with a complete solution for object recognition. So instead of going through the whole paper, this post will only focus on introducing the framework, accompanying with useful notes when implementing this algorithm during the CA.

> 1. Scale Space Extrema: Difference of Gaussian (DoG)
> 2. Keypoint Localization: Taylor Expansion
>    1. Contrast Threshold
>    2. Edge Threshold
> 3. Orientation Assignment
> 4. Keypoint Descriptor
> 5. Homography
> 6. RANSAC

1 ~ 4 are the main steps covered in the paper. 5 and 6 are implemented along with SIFT in the assignment, which are covered in another paper, [*Automatic Panoramic Image Stitching using Invariant Features*](https://link.springer.com/article/10.1007/s11263-006-0002-3), from the same team.

### 3.1 Scale Space Extrema: Difference of Gaussian (DoG)

> **Input:** an image $$I(x,y)$$  
> **Output:** the DoG $$D(x,y,\sigma)$$ and the locations of the scale space extrema in each DOG

When we think of selecting anchor points from an image, we prefer those stable ones, usually the extreme points or corners. It's easy to find the extreme points that have larger pixel values than neighbouring pixels. But this will also include noise pixels and pixels on the edges, making the features unstable. **Stable means the features points can be repeatably assigned under different views of the same object.** Also, we hope the same object can give close feature descriptors to simplify the matching. The design of descriptors will be introduced later.

Scale space extrema are those extrema points coming from the difference-of-Gaussian (DoG) pyramids. Each pyramid is called an *octave*, which is formed by $$s$$ filtered images using $$s$$ Gaussian kernels. An octave of $$s$$ Gaussian filtered images can create $$s-1$$ difference-of-Gaussian images. Then we rescale the image, down-sample it by a factor of 2, and repeat the process.

For an image $$I(x,y)$$ at a particular scale, $$L(x,y,\sigma)$$ is the convolution of a variable-scale Gaussian, $$G(x,y,\sigma)$$:

$$L(x,y,\sigma) = G(x,y,\sigma) * I(x,y)$$

The Gaussian blur in two dimensions is the product of two Gaussian functions:

$$G(x,y,\sigma) = \frac{1}{2\pi \sigma^2}e^{-\frac{x^2+y^2}{2\sigma^2}}$$

Note that the formula of a Gaussian function in one dimension is:

$$G(x, \sigma) = \frac{1}{\sqrt{2\pi \sigma^2}}e^{-\frac{x^2}{2\sigma^2}}$$

The difference-of-Gaussian $$D(x,y,\sigma)$$ is:

$$D(x,y,\sigma) = L(x,y,k\sigma) - L(x,y,\sigma)$$

The DoG function is a close approximation to the
scale-normalized Laplacian of Gaussian (LoG) function. It's proved that the extrema of LoG produces the most stable image features compared to a range of other possible image functions, such as the gradient, Hessian, or Harris corner function.

The maxima and minima of the difference-of-Gaussian images are then detected by comparing a
pixel to its 26 neighbors at the current and adjacent scales (8 neighbors in the current image and 9 neighbors in the scale above and below).

### 3.2 Keypoint Localization: Taylor Expansion

> **Input:** the locations of the scale space extrema from a DoG  
> **Output:** refined interpolated locations of the scale space extrema

Simply using the locations and the pixel values of the keypoints we get from 3.1 will not make the algorithm become invalid. However, the noise pixels will also give high response and be detected as keypoints in DoG.

The Taylor expansion with quadratic terms of $$D(x, y, \sigma)$$ is used to find out the location of the real extrema, $$(\hat{x}, \hat{y})$$ (or $$(x+\hat{x}, y+\hat{y})$$, $$(\hat{x}, \hat{y})$$ is the offset).

Let $$\bm{x} = (x, y, \sigma)^T$$ be the location of the keypoint $$(x, y)$$ in the DoG with variance $$\sigma$$, we have:

$$D(x, y, \sigma) = D(\bm{x}) \approx D + (\frac{\partial D}{\partial \bm{x}})^T \bm{x} + \frac{1}{2} \bm{x}^T \frac{\partial^2 D}{\partial \bm{x}^2} \bm{x}$$

See [Wikipedia](https://en.wikipedia.org/wiki/Multiplication_of_vectors) for more help on vector multiplication. By setting $$D(\bm{x}) = 0$$, we have the extremum:

$$\hat{\bm{x}} = -(\frac{\partial^2 D}{\partial \bm{x}^2})^{-1} \frac{\partial D}{\partial \bm{x}}$$

Since the computation only involves a 3x3 block around the keypoint candidate $$\bm{x}$$, we can copy the block and then set the center as original, $$(0, 0)$$. Then $$\hat{\bm{x}}$$ becomes the offset.

In case $$\hat{\bm{x}}$$ is larger than 0.5 **on any dimension**, it implies that the actual extremum is another pixel rather than $$\bm{x}$$. If so, we can set $$\hat{\bm{x}}$$ as the new center and fetch a new 3x3 block around it, repeat the calculation above till all the dimensions of $$\hat{\bm{x}}$$ are no larger than 0.5. With the final extremum, we can update the keypoints with the refined locations.

#### 3.2.1 Contrast Threshold

> **Input:** the refined location of a keypoint $$\hat{\bm{x}}$$  
> **Output:** the contrast of the keypoint and the decision on whether it's a noise pixel or not

The extremum location $$\hat{\bm{x}}$$ has another use in noise rejection. Most of the additional noise is not that strong. If the interpolated amplitude of the keypoint on DoG is less than 0.3, then it's dropped out as a noise pixel.

$$\vert D(\hat{\bm{x}}) \vert = \vert D + \frac{1}{2} (\frac{\partial D}{\partial \bm{x}})^T \hat{\bm{x}} \vert$$

Note that the image is normalized to $$[0, 1]$$ from $$[0, 255]$$.

#### 3.2.2 Edge Threshold

> **Input:** the refined location of a keypoint $$\hat{\bm{x}}$$  
> **Output:** whether it's on a line or a vertex

Using the 3x3 block around the keypoint we can also compute a 2x2 matrix called Hessian matrix. The trace and determinant can be represented as the sum and the product of the 2 eigenvalues, $$\alpha$$ and $$\beta$$ (say, $$\alpha > \beta$$). They are also called **principle curvatures**. $$\alpha$$ is the maximum curvature of the point and $$\beta$$ is the minimum curvature.

$$\bm{H} = \begin{bmatrix} D_{xx} & D_{xy} \\ D_{yx} & D_{yy} \end{bmatrix}$$

$$Tr(\bm{H}) = D_{xx} + D_{yy} = \alpha + \beta$$

$$Det(\bm{H}) = D_{xx} D_{yy} - D_{xy} D_{yx} = D_{xx} D_{yy} - D_{xy}^2 = \alpha \beta$$

Let $$r = \alpha / \beta$$, then:

$$\frac{Tr(\bm{H})^2}{Det(\bm{H})} = \frac{(\alpha + \beta)^2}{\alpha \beta} = \frac{(r+1)^2}{r}$$

The empirical threshold is $$r=10$$. If

$$\frac{Tr(\bm{H})^2}{Det(\bm{H})} > \frac{(r+1)^2}{r}, r=10$$

, then is more likely that the keypoint lies on a line.

Consider the image as a 3D surface. The height $$z$$ of a point on it is the pixel value of $$(x, y)$$. If the point lies on a line then it's on a ridge or valley, making $$\vert \alpha \vert \gg \beta$$.

![Full-width image](http://www.kgs.ku.edu/SEISKARST/images/curv02.png){:.lead width="800" height="100" loading="lazy"}

Figure 1
{:.figcaption}

### 3.3 Orientation Assignment

> **Input:**  the image location, scale, and orientation of a keypoint  
> **Output:** an orientation histogram

### 3.4 Keypoint Descriptor

> **Input:** the refined location of a keypoint $$\hat{\bm{x}}$$  
> **Output:** a 4x4x8 = 128 element feature vector

All the steps above are from the paper [Distinctive Image Features from Scale-Invariant Keypoints](https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=&cad=rja&uact=8&ved=2ahUKEwj64PX20YnvAhW58HMBHZu-CBkQFjACegQIARAD&url=https%3A%2F%2Fpeople.eecs.berkeley.edu%2F~malik%2Fcs294%2Flowe-ijcv04.pdf&usg=AOvVaw15zw_1-jkHXX0cNw5OgTU1). The library VLFeat used in the CA is 

### 3.5 Homography

> **Input:** $$n$$ pairs of anchors in both images $$(n \geq 4, usually 6)$$  
> **Output:** the homography matrix

*Under construction*

### 3.6 RANSAC

> **Input:** all keypoints in both images    
> **Output:** the best $$n$$ pairs of keypoints to be the anchors $$(n \geq 4)$$

*Under construction*

### 3.7 Implementing Automatic Image Stitching

### 3.9 Reference

1. [Distinctive Image Features from Scale-Invariant Keypoints](https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=&cad=rja&uact=8&ved=2ahUKEwj64PX20YnvAhW58HMBHZu-CBkQFjACegQIARAD&url=https%3A%2F%2Fpeople.eecs.berkeley.edu%2F~malik%2Fcs294%2Flowe-ijcv04.pdf&usg=AOvVaw15zw_1-jkHXX0cNw5OgTU1)
2. [Automatic Panoramic Image Stitching using Invariant Features](https://link.springer.com/article/10.1007/s11263-006-0002-3)