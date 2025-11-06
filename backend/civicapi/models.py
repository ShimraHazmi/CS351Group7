from django.db import models

class Candidate(models.Model):
    # Basic candidate info
    name = models.CharField(max_length=255, db_index=True)
    party = models.CharField(max_length=100, blank=True)
    
    # Race/Election info
    office = models.CharField(max_length=255)  # e.g., "President", "Senate"
    election_name = models.CharField(max_length=255, blank=True)
    election_type = models.CharField(max_length=100, blank=True)  # e.g., "General", "Primary"
    election_date = models.DateField(null=True, blank=True)
    
    # Location info
    country = models.CharField(max_length=2, default="US")
    state = models.CharField(max_length=2, blank=True)  # Province/State code
    district = models.CharField(max_length=100, blank=True)
    
    # Results (if available)
    votes = models.IntegerField(null=True, blank=True)
    vote_percent = models.FloatField(null=True, blank=True)
    
    # Contact/URLs
    candidate_url = models.URLField(blank=True)
    photo_url = models.URLField(blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    
    # API source tracking
    race_id = models.IntegerField(null=True, blank=True)  # civicAPI race ID
    source = models.CharField(max_length=50, default="civicapi")  # Track data source
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['state', 'office']),
            models.Index(fields=['election_date']),
        ]
        ordering = ['-election_date', 'name']
        unique_together = [['name', 'race_id']]  # Prevent duplicate candidates in same race
    
    def __str__(self):
        return f"{self.name} - {self.office} ({self.election_date or 'No date'})"
    