using API.Entities;
using Microsoft.AspNetCore.Mvc;

namespace API.Interfaces
{
    public interface IPhotoRepository
    {
        Task<Photo> AddPhotoAsync(Photo photo);
        Task<bool> SaveAllAsync();
        Task<Photo?> GetPhotoByIdAsync(int photoId);
        void RemovePhoto(Photo photo);
        Task<bool> SetMainPhotoAsync(int photoId, string memberId);
        Task<Photo?> GetMainPhoto(string memberId);
    }
}
