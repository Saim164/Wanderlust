const listing = require("../models/listing"); 

module.exports.index = async (req , res) => {
    const allListings = await listing.find({});
    res.render("listings/index" , { allListings });
};

module.exports.renderNewForm = (req , res)=>{
    res.render("listings/new");
};

module.exports.showListing = async (req , res) => {
    let {id} = req.params;
    const list = await listing.findById(id)
    .populate({path : "reviews" , populate : {path : "author"}})
    .populate("owner");
    if(!list){
    req.flash("error" , "Listing you requested for does not exist");
    return res.redirect("/listings")
    }
    res.render("listings/show" , { list });
};

module.exports.createListing = async (req , res , next)=>{
    let url = req.file.path;
    let filename = req.file.filename; 
    const newListing = new listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url , filename};
    await newListing.save();
    req.flash("success" , "New Listing Created");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req , res) => {
    let {id} = req.params;
    const list = await listing.findById(id);

    res.render("listings/edit" , { list });
}

module.exports.updateLisitng = async (req , res )=>{
    let {id} = req.params;
    const list= await listing.findByIdAndUpdate(id,{...req.body.listing});

    if(req.file){
    let url = req.file.path;
    let filename = req.file.filename; 
    list.image={ url , filename};
    await list.save();
    }

    req.flash("success" , "Listing Updated!");
    if(!list){
    req.flash("error" , "Listing you requested for does not exist");
    return res.redirect("/listings")
    }
    res.redirect(`/listings/${id}`);
}

module.exports.deleteListing = async (req , res )=>{
    let {id} = req.params;
    let deletedListing = await listing.findByIdAndDelete(id);
    req.flash("success" , "Listing Deleted!");
    res.redirect("/listings");
}