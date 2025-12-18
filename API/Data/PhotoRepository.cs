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
    }
}
