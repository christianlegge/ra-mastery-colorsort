import concurrent.futures
import colorsys
import requests
from PIL import Image
from io import BytesIO
import numpy as np
import cv2

def sort_images(urls):
    images = download_images(urls)
    url_with_dominant_hue = []
    for image in images:
        img = image[1]
        pixels = np.float32(img.reshape(-1, 3))

        n_colors = 3
        criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 200, .1)
        flags = cv2.KMEANS_RANDOM_CENTERS

        _, labels, palette = cv2.kmeans(pixels, n_colors, None, criteria, 10, flags)
        _, counts = np.unique(labels, return_counts=True)
        indices = np.argsort(counts)[::-1]
        dominant = palette[indices[0]]
        dominant_hls = colorsys.rgb_to_hls(dominant[0]/255, dominant[1]/255, dominant[2]/255)
        if dominant_hls[1] < 0.02 or dominant_hls[2] < 0.02 or dominant_hls[1] > 0.98:
            dominant = palette[indices[1]]
            dominant_hls = colorsys.rgb_to_hls(dominant[0]/255, dominant[1]/255, dominant[2]/255)
        if dominant_hls[1] < 0.02 or dominant_hls[2] < 0.02 or dominant_hls[1] > 0.98:
            dominant_hls = (1, 0, 0)
        url_with_dominant_hue.append((image[0], dominant_hls))
    # print(url_with_dominant_hue)
    # url_with_dominant_hue.sort(key=lambda x: x[1][2])
    # url_with_dominant_hue.sort(key=lambda x: x[1][1])
    url_with_dominant_hue.sort(key=lambda x: x[1][0])
    new_urls = [image[0] for image in url_with_dominant_hue]
    return new_urls

def url_to_image(filename):
    # print("Downloading", filename)
    url = f"https://media.retroachievements.org{filename}"
    img_data = requests.get(url)
    pil_image = Image.open(BytesIO(img_data.content)).convert("RGB")
    open_cv_image = np.array(pil_image)
    pil_image.close()
    return (filename, open_cv_image)

def download_images(urls):
    with concurrent.futures.ThreadPoolExecutor() as executor:
        return list(executor.map(url_to_image, urls))

