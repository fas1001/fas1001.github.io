library(dplyr)
library(tidyr)

df <- read.csv("../data/data_raw.csv")
df_clean <- data.frame(id = 1:nrow(df))

table(df$lifestyle_fishing_freq)
df_clean$lifestyle_fishing_freq_scale<- NA
df_clean$lifestyle_fishing_freq_scale[df$lifestyle_fishing_freq == "Never"] <- 0    
df_clean$lifestyle_fishing_freq_scale[df$lifestyle_fishing_freq == "Almost never"] <- 0.25
df_clean$lifestyle_fishing_freq_scale[df$lifestyle_fishing_freq == "Sometimes"] <- 0.5
df_clean$lifestyle_fishing_freq_scale[df$lifestyle_fishing_freq == "Often"] <- 0.75
df_clean$lifestyle_fishing_freq_scale[df$lifestyle_fishing_freq == " Very often"] <- 1
table(df_clean$lifestyle_fishing_freq_scale, useNA = "ifany")

saveRDS(df_clean, "data_clean.rds")

df <- read.csv("../data/df_fa_clean.csv")

df_fa <- df_clean %>%
  select(lifestyle_fishing_scale, 
         lifestyle_hunting_scale, 
         lifestyle_guns_number_scale,
         lifestyle_motorized_scale, 
         lifestyle_pickup_scale,
         lifestyle_eat_meat_scale) %>%
  drop_na() # Supprimer les valeurs manquantes

sondr::topdown_fa(df_fa)

df_fa_2 <- df_fa %>%
  select(-c(lifestyle_eat_meat_scale, 
            lifestyle_pickup_scale)) 

sondr::topdown_fa(df_fa_2)

df$scale_redneck <- NA
df$scale_redneck <- (df$lifestyle_motorized_freq_scale +
                    df$lifestyle_hunting_freq_scale +
                    df$lifestyle_fishing_freq_scale +
                    df$lifestyle_pickup_scale +
                    df$lifestyle_guns_number_scale) / 5
table(df$scale_redneck)
hist(df$scale_redneck)

saveRDS(df, "data_scale.rds")
