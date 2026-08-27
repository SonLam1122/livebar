// =========================================================================
// TAOLIVETUONGTAC - UNIFIED DASHBOARD ENTRY POINT
// =========================================================================

document.addEventListener('DOMContentLoaded', async () => {
  await loadScreensData();
  setupTabs();
  setupGameSwitchers();
  setupSimulatorDrawer();
  setupGlobalActions();
  setupRuleModal();
  setupInputListeners();
  setupThemeListeners();
  setupSoundManagerListeners();
  setupDashboardSocket();
});
