using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Entities;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class PhotoRepository(AppDbContext context) : IPhotoRepository
    {
        public async Task<Photo> AddPhotoAsync(Photo photo)
        {
            // Does this member already have any photos?
            var hasAnyPhotos = await context.Photos.AnyAsync(p => p.MemberId == photo.MemberId);

            // If this is their first photo, make it main and update Member.ImageUrl
            if (!hasAnyPhotos)
            {
                photo.IsMain = true;

                var member = await context.Members.FindAsync(photo.MemberId);
                if (member != null)
                {
                    member.ImageUrl = photo.Url;
                }
            }
            else
            {
                photo.IsMain = false;
            }

            context.Photos.Add(photo);
            await SaveAllAsync();

            return photo;
        }

        public async Task<Photo?> GetPhotoByIdAsync(int photoId)
        {
            return await context
                .Photos.Include(p => p.Member)
                .FirstOrDefaultAsync(p => p.Id == photoId);
        }

        public void RemovePhoto(Photo photo)
        {
            context.Photos.Remove(photo);
        }

        public async Task<bool> SaveAllAsync()
        {
            return await context.SaveChangesAsync() > 0;
        }

        public async Task<bool> SetMainPhotoAsync(int photoId, string memberId)
        {
            // Load all photos for the member
            var photos = await context.Photos.Where(p => p.MemberId == memberId).ToListAsync();

            var newMain = photos.SingleOrDefault(p => p.Id == photoId);
            if (newMain == null)
                return false;

            // Unset previous main photo
            foreach (var photo in photos)
            {
                photo.IsMain = false;
            }

            // Set new main
            newMain.IsMain = true;

            // Update Member.ImageUrl
            var member = await context.Members.FindAsync(memberId);
            if (member == null)
                return false;

            member.ImageUrl = newMain.Url;

            return await SaveAllAsync();
        }
    }
}
