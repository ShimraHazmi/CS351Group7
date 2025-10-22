from django.db import models
#maybe we want a sql database or a .txt file. 

class Candidate(models.Model):
    name = models.CharField(max_length=255, db_index=True)
    office = models.CharField(max_length=255)
    party = models.CharField(max_length=100, blank=True)
    election_date = models.DateField(null=True, blank=True)
    state = models.CharField(max_length=2, blank=True)
    district = models.CharField(max_length=100, blank=True)
    candidate_url = models.URLField(blank=True)
    photo_url = models.URLField(blank=True)
    
    # Additional fields from Google Civic API
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['state', 'office']),
        ]
        ordering = ['name']
    def __str__(self):
        return f"{self.name} - {self.office}"
    