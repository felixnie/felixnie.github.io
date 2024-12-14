---
layout: post
title: Robust Real-time Object Detection (ICCV2001)
description: >
  *Robust Real-time Object Detection* on ICCV 2001 is proposed by Paul Viola and Michael Jones, which introduced a general framework for object detection. The paper, also named *Robust Real-time Face Detection* and *Rapid Object Detection using a Boosted Cascade of Simple Features* (on CVPR 2001), has over 15,000 citations.
image: 
sitemap: false
---

* this unordered seed list will be replaced by the toc
{:toc}

## 1. Viola-Jones Face Detection Algorithm

Face detection or object detection is a binary classification problem different from face recognition. Face detection can consider a substantial part of face recognition operations. Opposite to many of the existing algorithms using one single strong classifier, the Viola-Jones algorithm uses a set of weak classifiers, constructed by thresholding each of the Haar-like features. They can then be ranked and organized into a cascade.

The 3 main contributions in Viola-Jones face detection algorithm are **integral image**, **AdaBoost-based learning** and **cascade classifier structure**. The first step is to apply **Haar-like feature extraction**, which is an accelerated variant of image convolution using **integral image**. The lengthy features are then being selected by a learning algorithm based on **AdaBoost**. The **cascade classifiers** can drop the negative samples quickly and expedite the testing process enormously. Let's have a quick go through towards the important points of the paper.

### 1.1 Feature Extraction: Haar-like Features

> We can format this step as:  
> **Input:** a 24 × 24 image with zero mean and unit variance  
> **Output:** a 162336 × 1 scalar vector with its feature index ranging from 1 to 162336

This paper is a good example of combining classical CV with ML techniques. In the feature extraction step, CNN is not used. Instead, the intuitive Haar-like features are adopted.

<p align="center">
  <img width="60%" height="60%" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJ-gAkVCM8DgB1Kqc_jddYsronNtP2-NGXTA&usqp=CAU">
</p>

Figure 1
{:.figcaption}

The sum of the pixels which lie within the black regions is subtracted from the sum of pixels in the white regions. The mask set consists of 2 two-rectangle edge features, 2 three-rectangle line features, and a four-rectangle feature, which can be seen as a diagonal line feature. They are called Haar-like since the elements are all +1/-1, just like the square-shaped functions in Haar wavelet.

They are effective for tasks like face detection. Regions like eye sockets and cheeks usually have a distinctly bright and dark boundary, while nose and mouse can be considered as lines with a specific width.

<a id="figure-2"></a>
<p align="center">
  <img width="60%" height="60%" src="https://docs.opencv.org/3.4/haar.png">
</p>

Figure 2
{:.figcaption}

The masks are applied over the sliding windows with a size of 24x24. The window is called a *detector* in the paper and 24x24 is *the base solution of the detector*. We'll discuss how to get the detectors later. The 5 masks, starting from size 2x1, 3x1, 1x2, 1x3, 2x2, to the size of a detector, will slide over the whole window. For example, a 2x1 edge mask will move row by row, then extend to 4x1 and move all over the window again ... until 24x1; then it starts over from 2x2 to 24x2, 2x3 to 24x3, 2x4 to 24x4 ... till it became 24x24.

It's time to answer why the length of the output descriptor is 162336. A 24x24 image has 43200, 27600, 43200, 27600 and 20736 features of category (a), (b), (c), (d) and (e) respectively, hence 162336 features in all.

Here is a MATLAB script for the calculation of the total number of features. Note that some would say the total number is 180625. That's the result when you use two four-rectangle features instead of one.

```
frameSize = 24;
features = 5;
% All five feature types:
feature = [[2,1]; [1,2]; [3,1]; [1,3]; [2,2]];
count = 0;
% Each feature:
for ii = 1:features
    sizeX = feature(ii,1);
    sizeY = feature(ii,2);
    % Each position:
    for x = 0:frameSize-sizeX
        for y = 0:frameSize-sizeY
            % Each size fitting within the frameSize:
            for width = sizeX:sizeX:frameSize-x
                for height = sizeY:sizeY:frameSize-y
                    count=count+1;
                end
            end
        end
    end
end
display(count)
```
Now we understand how to define and extract our features. But some detailed operations are still not covered, which made me confused when I first learned this part of the algorithm. 

**⚠️ Nitty-gritty alert!**

**Getting Detectors**  
So where do the *detectors* come from? A [video](https://www.youtube.com/watch?v=zokoTyPjzrI&ab_channel=StevenVanVaerenbergh) I found gives the perfect demonstration.  
The size of a box that might have a face inside varies a lot between different photos. (The size of the original photos in the discussion is 384x288.) So basically we can select the size of the box empirically (no smaller than 24x24) and then resize it to a 24x24 detector.  
The paper also proposed a standardized scheme. We can scan the image with a 24x24 fixed size detector. Instead of enlarging the detector, the image is down-sampled by a factor of 1.25 before being scanned again. A pyramid of up to 11 scales of the image is used, each 1.25 times smaller than the last.  
The moving step of the 24x24 detector is one pixel, horizontally and vertically. For the resized image, the equivalent moving step is larger than 1. So the down-sampled image pyramid can adjust the equivalent detector size and the moving step size at the same time.
{:.note}

**Normalization before Convolution**  
The selected 24x24 detectors are first normalized before the convolution with the features. If the variance of a detector is lower than a specific threshold, then it must be plain and has little information of interest which can be left out of consideration immediately, saving some time processing the backgrounds.
{:.note}

**Performance Issue**  
In fact, for better detection performance we can discard 3 features and only keep features (c) and (b). Like in [Figure 2](#figure-2). Given the computational efficiency, the detection process can be completed for an entire image at every scale at up to 15 fps. Of course, with advanced machines 20 years later it's better to utilize all the 5 Harr-like features.
{:.note}

### 1.2 Fasten Convolution Process: Integral Image

> We can format this step as:  
> **Input:** a N × M image *I*  
> **Output:** a N × M integral image *II*

Remember the +1/-1 rectangles in Haar-like features? It'll be tedious if we simply multiply the feature masks with the pixels in the corresponding region. Integral image is a smart way to replace the convolution with only a few additions.

<p align="center">
  <img width="60%" height="60%" src="https://www.researchgate.net/profile/Gerhard_Roth/publication/220494200/figure/fig2/AS:305554581934081@1449861297061/The-integral-image-Left-A-simple-input-of-image-values-Center-The-computed-integral.png">
</p>

Figure 3
{:.figcaption}

In an integral image, each pixel at $$(x,y)$$ is the sum of all the pixels on the top-left: 

$$II(x,y) = \sum_{i=1}^{x} \sum_{j=1}^{y} I(i,j)$$

This simplified representation with sums of rectangles can speed up the feature extraction significantly. Only $$1+2+1+2+4=10$$ operations are needed to compute the convolution of 5 masks on one position.

### 1.3 Feature Selection: AdaBoost

> We can format this step as:  
> **Input:** the descriptor $$x$$ and label $$y$$ for each training sample (about 5k positive and 5k negative)  
> **Output:** a strong classifier $$h(x)$$ consists of $$T$$ weak classifiers $$h_t(x)$$ from $$T$$ features

This step is to train a classification function using the feature set (a set of Haar-like feature masks with different sizes, patterns, and locations all over the images) and a training set of positive and negative images (no less than 5,000 24x24 faces and 5,000 24x24 non-faces). The illustration [below](#figure-5) can help build a good understanding quickly. 

![Full-width image](/assets/img/img-ee5731/adaboost-algorithm.png){:.lead width="800" height="100" loading="lazy"}

Figure 4 AdaBoost Algorithm
{:.figcaption}

A weak classifier is chosen on each iteration. And the falsely classified samples are given higher weights in the next iteration. The next classifier will pay extra attention to the misclassified training samples. Combining the weak classifiers, in this case, the low-level boundaries, we have a high-level boundary, which is considered as a strong classifier.

People always describe AdaBoost as **a Forest of Stumps**. The analogy just tells the exact nature of AdaBoost. AdaBoost means **Adaptive Boosting**. There are many boosting algorithms. Remember the random forest binary classifier? Each of the trees is built with random samples and several features from the full dataset. Then the new sample is fed into each decision tree, being classified, and collect the labels to count the final result. During the training process, the order doesn't matter at all, and all the trees are equal. In the forest of stumps, all the trees are 1-level, calling stumps (only root and 2 leaves in binary classification problems). Each stump is a weak classifier using only 1 feature from the extracted features. First, we find the best stump with the lowest error. It will suck. A weak classifier is only expected to function slightly better than randomly guessing. It may only classify the training data correctly 51% of the time. The next tree will then emphasize the misclassified samples and will be given a higher weight if the last tree doesn't go well.

<a id="figure-5"></a>
<p align="center">
  <img width="80%" height="80%" src="https://www.codeproject.com/KB/AI/4114375/cdac8dae-bfa9-42c7-88b5-99cfbced7fec.Png">
</p>

Figure 5
{:.figcaption}

The algorithm from the [paper](https://www.cs.cmu.edu/~efros/courses/LBMV07/Papers/viola-cvpr-01.pdf) can be summarized as above. It's adequate for a basic implementation of the algorithm, like this [project](https://github.com/Simon-Hohberg/Viola-Jones). In spite of this, there are still some details that merit the discussion.

**⚠️ Nitty-gritty alert!**

#### 1.3.1 Decision Stump by Exhaustive Search

> We can format this step as:  
> **Input:** the $$f$$-th feature of all $$n$$ samples, the weights of all samples
> **Output:** a weak classifier $$h_t(x)$$

Now we know how to build a combination of weak classifiers. But the optimal decision stump search is always left out in some projects like [this](https://github.com/Simon-Hohberg/Viola-Jones), and even in the [paper](https://www.cs.cmu.edu/~efros/courses/LBMV07/Papers/viola-cvpr-01.pdf) itself.

Luckily, an [explanation](https://www.ipol.im/pub/art/2014/104/article.pdf) I found solved all my problems. The resources mentioned in this post are listed in the [reference](#15-reference) section.

A single decision stump is constructed with 4 parameters: threshold, toggle, error, and margin.

| Parameter | Symbol | Definition |
|-----------|--------|------------|
| Threshold | $$\tau$$ | The boundary of decision. |
| Toggle | $$\Tau$$ | Decide if it means +1 (positive) or -1 (negative) when $$>\tau$$. |
| Error | $$\Epsilon$$ | The classification error after threshold and toggle are set up. |
| Margin | $$\Mu$$ | The largest margin among the ascending feature values. |

The **exhaustive search algorithm of decision stumps** takes the $$f$$-th feature of all the $$n$$ training examples as input, and returns a decision stump's 4-tuple $$\left\{ \tau, \Tau, \Epsilon, \Mu \right\}$$.

First, since we need to compute the margin $$\Mu$$, the gap between each pair of adjacent feature values, the $$n$$ examples are rearranged in ascending order of feature $$f$$. For the $$f$$-th feature, we have

$$x_{f_1} \leq x_{f_2} \leq x_{f_3} \leq ... \leq x_{f_n}$$

$$x_{f_n}$$ is the largest value among the $$f$$-th feature of all $$n$$ samples. It doesn't mean the $$n$$-th sample since they are sorted.

In the initialization step, $$\tau$$ is set to be smaller than the smallest feature value $$x_{f_1}$$. Margin $$\Mu$$ is set to 0 and error $$\Epsilon$$ is set to an arbitrary number larger than the upper bound of the empirical loss.

Inside the $$j$$-th iteration, a new threshold $$\tau$$ is computed, which is the mean of the adjacent values:

$$\hat{\tau} = \frac{x_{f_j} + x_{f_{j+1}}}{2}$$

And the margin is computed as:

$$\hat{\Mu} = x_{f_{j+1}} - x_{f_j}$$

We compute the error $$\hat{\Epsilon}$$ by collecting the weight $$w_{f_j}$$ of the misclassified samples. Since the toggle is not decided yet, we have to calculate $$error_+$$ and $$error_-$$ for both situations. If $$error_+ < error_-$$, then we decide that toggle $$\hat{\Tau} = +1$$, otherwise $$\hat{\Tau} = -1$$. Finally, the tuple of parameters with smallest error is kept as $$\left\{ \tau, \Tau, \Epsilon, \Mu \right\}$$.

![Full-width image](/assets/img/img-ee5731/adaboost-algorithm-4.png){:.lead width="800" height="100" loading="lazy"}

Figure 6 Decision Stump by Exhaustive Search
{:.figcaption}

#### 1.3.2 Selecting the Best Stump

> We can format this step as:  
> **Input:** $$d$$ stumps for $$d$$ given features  
> **Output:** the best decision stump

During each training round $$t$$ in AdaBoost, a weak classifier $$h_t(x)$$ is selected. For each feature, we utilize the method in [1.3.1](#131-decision-stump-by-exhaustive-search) to decide on the best parameter set for the decision stump.

$$1 \leq t \leq T$$, $$T$$ is the total number of weak classifiers, usually we let $$T$$ be the full length of the feature vector.
{:.note}

The best stump among all the stumps should have the lowest error $$\Epsilon$$. We select the one with the largest margin $$\Mu$$ when the errors happen to be the same. It then becomes the $$t$$-th weak classifier. The weights assigned to all $$n$$ samples will be adjusted, and thus the exhaustive search should be carried out again using the updated weights. The idea behind this part is quite straightforward.

![Full-width image](/assets/img/img-ee5731/adaboost-algorithm-5.png){:.lead width="800" height="100" loading="lazy"}

Figure 7 Best Stump
{:.figcaption}

![Full-width image](/assets/img/img-ee5731/adaboost-algorithm-6.png){:.lead width="800" height="100" loading="lazy"}

Figure 8 AdaBoost Algorithm with Optimal $$h_t(x)$$
{:.figcaption}

### 1.4 Fasten Classification: Cascade Classifier

> We can format this step as:  
> **Input:** samples and features  
> **Output:** a cascade classifier, each step consists of several weak classifiers

As described in the subtitle, the main goal of building the cascade is to accelerate the estimation when dealing with a new input image, say, 384x288 (preset in the paper). Most of the sub-windows used to detect potential faces will have negative output. We hope to drop out those with backgrounds and non-faces as soon as possible.

Some will call this an **attentional cascade**. We hope to pay more attention to those sub-windows that might have faces inside them.

Our goal can be summarized as:

1. Weed out non-faces early on to reduce calculation.
2. Pay more attention to those **hard** samples since negative samples are dropped in advance.

<p align="center">
  <img width="60%" height="60%" src="https://www.researchgate.net/profile/Mahdi_Rezaei6/publication/233375515/figure/fig1/AS:341180333215748@1458355138644/The-structure-of-the-Viola-Jones-cascade-classifier.png">
</p>

Figure 9
{:.figcaption}

The decision cascade is formed using a series of stages, each consists of several weak classifiers. Recall the strong classifier we build in [1.3](#13-feature-selection-adaboost), $$h(x)$$ is the sum of weighted votes of all the weak classifiers/stumps. This scheme is already sufficient to achieve face detection. Some [projects](https://github.com/Simon-Hohberg/Viola-Jones) just use this form of strong classifier instead of an attentional cascade. But the first goal reminds us that we shouldn't use all $$T$$ weak classifiers to deal with every detector, which will be extremely time-consuming.

At each stage, or some may call it a layer or classifier, we can use only part of the weak classifiers, as long as a certain false positive rate and detection rate can be guaranteed. In the next stage, only the positive and false-positive samples (the **hard** samples) are used to train the classifier. All we need to do is set up the **maximum acceptable false-positive rate** and the **minimum acceptable detection rate** per layer, as well as the **overall target false positive rate**.

<p align="center">
  <img width="60%" height="60%" src="https://miro.medium.com/max/875/1*1EFSD2Fme-OIXRf5RAB_rQ.png">
</p>

Figure 10
{:.figcaption}

We iteratively add more features to train a layer so that we can achieve higher detection rate and lower false-positive rate, till the requirements are satisfied. Then we move to next layer. We obtain the final attentianal cascade once the overall target false positive rate is low enough.

Hope my interpretation can help you understand the algorithm.

### 1.5 Reference

1. [Rapid Object Detection using a Boosted Cascade of Simple Features](https://www.cs.cmu.edu/~efros/courses/LBMV07/Papers/viola-cvpr-01.pdf)
2. [Haar-like feature - Wikipedia](https://en.wikipedia.org/wiki/Haar-like_feature#:~:text=A%20Haar%2Dlike%20feature%20considers,categorize%20subsections%20of%20an%20image.)
3. [Viola–Jones object detection framework - Wikipedia](https://en.wikipedia.org/wiki/Viola%E2%80%93Jones_object_detection_framework)
4. [Viola-Jones' face detection claims 180k features - Stack Overflow](https://stackoverflow.com/questions/1707620/viola-jones-face-detection-claims-180k-features)
5. [An Analysis of the Viola-Jones Face Detection Algorithm](https://www.ipol.im/pub/art/2014/104/article.pdf)
6. [AdaBoost, Clearly Explained - YouTube](https://www.youtube.com/watch?v=LsK-xG1cLYA&ab_channel=StatQuestwithJoshStarmer)
7. [GitHub - Simon-Hohberg/Viola-Jones: Python implementation of the face detection algorithm by Paul Viola and Michael J. Jones](https://github.com/Simon-Hohberg/Viola-Jones)
8. [Understanding and Implementing Viola-Jones (Part Two)](https://medium.com/datadriveninvestor/understanding-and-implementing-viola-jones-part-two-97ae164ee60f)