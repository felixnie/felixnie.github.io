---
layout: post
title:  An Overview of EE5731 Visual Computing
description: >
  Visual Computing is a module I took this semester at NUS ECE, hosted by Assoc. Prof. Robby Tan. It covers some of the best-known classic CV algorithms.
image: /assets/img/img-ee5731/bg.gif
sitemap: false
---

These years, rapid progressions in Deep Learning have brought enormous improvements to vision-based applications. DL methods, mainly based on CNN frameworks, are constructed usually by training instead of the domain-specific designing and programming in the traditional CV algorithms. They are easy to build, often achieve better accuracy, and the trained models can be very lightweight. So why do we still need to learn about traditional CV methods?

Unlike the black box models in machine learning, traditional CV algorithms are more explainable and tunable. They are also more general in some way since the design of the feature extraction process doesn't rely on any specific image dataset. Therefore, algorithms like SIFT are often used for image stitching and 3D mesh reconstruction, which don't require any class knowledge. And DL can sometimes overkill, while many traditional CV techniques can also be simplified and implemented on devices like microcontrollers.

The EE5731 Visual Computing module provides us with knowledge on topics including:

1. [Viola-Jones Face Detection Algorithm]({{ site.baseurl }}{% link modules/_posts/2021-05-03-ee5731-1-viola-jones-face-detection-algorithm.md %}) <span style="color:red">**Finished**</span>
   1. Feature Extraction: Haar-like Features
   2. Fasten Convolution Process: Integral Image
   3. Feature Selection: AdaBoost
   4. Fasten Classification: Cascade Classifier
2. Histogram of Oriented Gradients (HOG) Features and Human Detection
3. [Scale Invariant Feature Transform (SIFT) Algorithm and Image Stitching]({{ site.baseurl }}{% link modules/_posts/2021-05-04-ee5731-2-panoramic-image-stitching.md %}) <span style="color:blue">**Under Construction**</span>
   1. Scale Space Extrema: Difference of Gaussian (DoG)
   2. Keypoint Localization: Taylor Expansion
   3. Orientation Assignment
   4. Keypoint Descriptor
   5. Homography
   6. RANSAC
4. Camera Parameters <span style="color:blue">**Under Construction**</span>
   1. Forward Propagation
   2. Backward Propagation
5. Depth from Stereo <span style="color:blue">**Under Construction**</span>
6. Markov Random Field <span style="color:blue">**Under Construction**</span>
7. Depth from Video <span style="color:blue">**Under Construction**</span>
8. Optical Flow
9. Structure Decomposition



