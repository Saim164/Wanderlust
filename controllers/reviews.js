const review = require("../models/review.js");
const listing = require("../models/listing.js");

module.exports.createReview = async(req,res) =>{
   let listingDoc = await listing.findById(req.params.id);
   let newReview = new review(req.body.review);
   newReview.author = req.user._id;
   listingDoc.reviews.push(newReview);

   await newReview.save(); 
   await listingDoc.save();
   req.flash("success" , "New Review Created");
   console.log("new res saved");

   res.redirect(`/listings/${listingDoc._id}`);
}

module.exports.deleteReview = async(req,res)=>{
    let {id , reviewId} = req.params;
    
    await listing.findByIdAndUpdate( id , { $pull : { reviews: reviewId }});
    await review.findByIdAndDelete(reviewId);
    req.flash("success" , "Review Deleted!");
    res.redirect(`/listings/${id}`);

}