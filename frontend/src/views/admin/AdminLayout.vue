<template>
  <div class="page-wrapper">
    <SidebarNav />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>
<script setup>
import SidebarNav from '@/components/shared/SidebarNav.vue'
</script>
