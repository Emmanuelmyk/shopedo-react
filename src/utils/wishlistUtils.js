export const getWishlistItems = () => {
  return JSON.parse(localStorage.getItem("wishlistItems") || "[]");
};

export const addToWishlist = (product) => {
  const wishlist = getWishlistItems();
  const existingIndex = wishlist.findIndex((item) => item.id === product.id);

  if (existingIndex === -1) {
    wishlist.push({
      id: product.id,
      name: product.name,
      price: product.price,
      category_id: product.category_id,
      img_path: product.img_path,
      description: product.description,
      condition: product.condition,
      location: product.location,
    });
    localStorage.setItem("wishlistItems", JSON.stringify(wishlist));
    return true;
  }
  return false;
};

export const removeFromWishlist = (productId) => {
  const wishlist = getWishlistItems();
  const filtered = wishlist.filter((item) => item.id !== productId);
  localStorage.setItem("wishlistItems", JSON.stringify(filtered));
};

export const isInWishlist = (productId) => {
  const wishlist = getWishlistItems();
  return wishlist.some((item) => item.id === productId);
};

export const getWishlistCount = () => {
  return getWishlistItems().length;
};

export const shareProduct = (productId, productName, productPrice) => {
  const url = `${window.location.origin}/product-detail?id=${productId}`;
  const title = `${productName} on EDOFINDS.NG`;
  const text = `Check out ${productName} for ₦${productPrice.toLocaleString()} on EDOFINDS.NG!`;

  if (navigator.share) {
    navigator
      .share({ title, text, url })
      .catch((err) => console.error("Error sharing", err));
  } else {
    navigator.clipboard
      .writeText(url)
      .then(() => alert("Link copied to clipboard: " + title))
      .catch((err) => {
        console.error("Error copying", err);
        prompt("Please copy this link to share:", url);
      });
  }
};
