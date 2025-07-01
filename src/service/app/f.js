authService.getAll = async (request) => {
    const userId = request?.query?._id;
    
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return [];
    }
    
    return await userModel.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(userId),
                status: 'active',
                is_deleted: '0'
            }
        },
        {
            $lookup: {
                from: "links",
                localField: "_id",
                foreignField: "userId",
                as: "allLinks",
                pipeline: [
                    {
                        $match: {
                            status: 'active',
                            is_deleted: '0'
                        }
                    },
                    {
                        $addFields: {
                            sort_index: {
                                $ifNull: ["$is_index", 999999]
                            }
                        }
                    },
                    {
                        $sort: {
                            sort_index: 1
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            linkTitle: 1,
                            linkUrl: 1,
                            linkLogo: 1,
                            type: 1,
                            status: 1,
                            is_index: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                socialLinks: {
                    $filter: {
                        input: "$allLinks",
                        as: "link",
                        cond: { $eq: ["$$link.type", "social"] }
                    }
                },
                nonSocialLinks: {
                    $filter: {
                        input: "$allLinks",
                        as: "link",
                        cond: { $eq: ["$$link.type", "non_social"] }
                    }
                }
            }
        },
        {
            $addFields: {
                links: {
                    $concatArrays: ["$socialLinks", "$nonSocialLinks"]
                }
            }
        },
        {
            $project: {
                _id: 1,
                username: 1,
                email: 1,
                bio: 1,
                profile_img: 1,
                banner_img: 1,
                links: 1,
                socialLinks: 1,    // Optional: include separate arrays
                nonSocialLinks: 1  // Optional: include separate arrays
            }
        }
    ]);
};
